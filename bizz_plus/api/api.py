import frappe, json
from pypika import functions, Order
from frappe.utils import flt, now, time_diff, today, add_days, getdate, get_first_day, get_last_day, get_year_start, get_year_ending, add_to_date

@frappe.whitelist()
def get_users():
    has_role = frappe.qb.DocType("Has Role")
    user = frappe.qb.DocType("User")
    roles = ["Brand Pilot", "Super Stockiests and Distributor Pilots"]
    
    users = (
        frappe.qb
        .from_(has_role)
        .join(user)
        .on(user.name == has_role.parent)
        .select(has_role.parent.as_("name"))
        .distinct()
        .where(
            (has_role.role.isin(roles)) &
            (has_role.parenttype == "User") &
            (user.enabled == 1)
        )
    ).run(as_dict=True)
    
    return users

@frappe.whitelist()
def get_lead_details(toggle, timeline, lead, lead_type):    
    if lead:
        
        from_date, to_date = get_date_range(timeline)
        
        lead = frappe.get_doc("Lead", lead)
        if lead_type == "manufacturer":
            lead_mappings = [x.name for x in frappe.get_all("Lead Mapping", {"parent_lead": lead.name})]
            
        else:
            lead_mappings = [x.name for x in frappe.get_all("Lead Mapping", {"mapped_lead": lead.name})]
        
        if toggle in ["commission", "payments"]:
            lmp = frappe.qb.DocType("Lead Mapping Payment")
        else:
            lmp = frappe.qb.DocType("Lead Mapping Tax Invoice")
        
        lead_payments = (
            frappe.qb.from_(lmp)
            .select(
                lmp.parent,
                lmp.name,
                functions.Date(lmp.creation).as_('creation'),
                lmp.commission_amount,
                lmp.amount
            )
            .where(
                lmp.parent.isin(lead_mappings)
                & lmp.creation.between(from_date, to_date)
            )
            .orderby(lmp.creation, order=Order.asc)
        ).run(as_dict=True)
        
        count = time_elapsed = avg = total = amount = 0
        last_date = None
        for payment in lead_payments:
            count += 1
            total += flt(payment.get("commission_amount"))
            amount += payment.get("amount")
            last_date = payment.creation
        
        time_elapsed = time_diff(now(), last_date).days if last_date else None
        
        if toggle in ["invoice", "payments"]:
            total = amount
            
        avg = flt(total / count, 2) if total else 0
        
        return {
            "count": count,
            "avg": avg,
            "total": total,
            "last_date": last_date,
            "time_elapsed": time_elapsed,
        }
        
def get_date_range(timeline):
    today = getdate()
    from_date = today
    to_date = add_days(today, 1)
    
    if timeline == "Yesterday":
        from_date = add_days(today, -1)
        to_date = today
        
    if timeline == "Last 7 Days":
        from_date = add_days(today, -7)
        to_date = add_days(today, 1)
        
    if timeline == "Last 14 Days":
        from_date = add_days(today, -14)
        to_date = add_days(today, 1)
        
    if timeline == "This Month":
        from_date = get_first_day(add_to_date(today))
        to_date = get_last_day(today)
        
    if timeline == "Last Month":
        from_date = get_first_day(add_to_date(today, months=-1))
        to_date = get_last_day(add_to_date(today, months=-1))
        
    if timeline == "Last 3 Months":
        from_date = get_first_day(add_to_date(today, months=-3))
        to_date = get_last_day(today)
        
    if timeline == "This Year":
        from_date = get_year_start(today)
        to_date = get_year_ending(today)
        
    return getdate(from_date), getdate(to_date)

@frappe.whitelist()
def update_clause(terms, parent_lead, mapped_lead):
    lead_mapping = frappe.get_doc("Lead Mapping", {"parent_lead": parent_lead, "mapped_lead": mapped_lead})
    
    lead_mapping.set("terms_and_conditions", [])
    for row in terms:
        lead_mapping.append("terms_and_conditions", {
            "clause": row.get("clause"),
            "response": row.get("response")
        })
        
    lead_mapping.save()