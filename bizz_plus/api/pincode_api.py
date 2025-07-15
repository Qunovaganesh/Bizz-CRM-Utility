import requests
import frappe

@frappe.whitelist()
def get_state_district_from_pin(pin_code):
    try:
        url = f"https://api.postalpincode.in/pincode/{pin_code}"
        response = requests.get(url, timeout=5)
        data = response.json()

        if data and data[0]['Status'] == 'Success':
            po = data[0]['PostOffice'][0]
            return {
                "state": po["State"],
                "district": po["District"],
                "city": po["Name"] 
            }
        else:
            return {"error": "Invalid PIN or no data found."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Pincode API Error")
        return {"error": str(e)}


import frappe

def after_insert_or_update_lead(doc, method):
    if doc.workflow_state != "Converted":
        return

    if frappe.db.exists("Manufacturer Company", {"lead": doc.name}) or \
       frappe.db.exists("Distributor Company", {"lead": doc.name}):
        return

    if doc.custom_lead_category == "Manufacturer Lead":
        frappe.get_doc({
            "doctype": "Manufacturer Company",
            "manufacturer": doc.company_name,
            # "email": doc.email_id,
            # "phone": doc.phone,
            # "lead": doc.name
        }).insert(ignore_permissions=True)

        frappe.msgprint(
            f"Congratulations! A new Brand with name {doc.company_name} on boarded"
        )
    else:
        frappe.get_doc({
            "doctype": "Distributor Company",
            "distributor": doc.custom_distributor_company_name,
            "super_stockist__distributor":doc.custom_super_stockiest_or_distributor,
            "company_name": doc.custom_distributor_company_name,
            # "phone": doc.phone,
            # "lead": doc.name
        }).insert(ignore_permissions=True)

        frappe.msgprint(
            f"Congratulations! A new Distributor with name {doc.custom_distributor_company_name} on boarded"
        )



    
import frappe
from frappe import _

import frappe
from frappe import _


@frappe.whitelist()
def get_company_hierarchy():
    try:
        manufacturers = frappe.get_all("Manufacturer Company",
            fields=["manufacturer as id", "manufacturer as name"]
        )

        all_distributors = frappe.get_all("Distributor Company",
            fields=["name", "company_name", "super_stockist__distributor"]
        )
        distributor_dict = {d['name']: d for d in all_distributors}

        manuf_mappings = frappe.get_all("Manufactuer Distributor Mapping",
            fields=["manufacturer", "distributor"]
        )
        stockiest_mappings = frappe.get_all("Stockiest Distributor Mapping",
            fields=["stockiest", "distributor"]
        )

        hierarchy = []
        people_set = set()
        seen_super_stockists = set()
        seen_distributors = set()

        for mfg in manufacturers:
            brand_id = mfg.id
            brand_data = {
                "id": brand_id,
                "name": mfg.name,
                "super_stockists": [],
                "distributors": []
            }

            brand_mappings = [m for m in manuf_mappings if m['manufacturer'] == brand_id]

            for mapping in brand_mappings:
                dist_id = mapping['distributor']
                dist = distributor_dict.get(dist_id)
                if not dist:
                    continue

                role = dist.super_stockist__distributor
                people_set.add(dist_id)

                if role == "Super Stockiest":
                    children = [
                        d['distributor'] for d in stockiest_mappings if d['stockiest'] == dist_id
                    ]
                    brand_data["super_stockists"].append({
                        "person_id": dist_id,
                        "distributors": children
                    })
                    seen_super_stockists.add(dist_id)
                    seen_distributors.update(children)
                    people_set.update(children)
                elif role == "Distributor":
                    brand_data["distributors"].append(dist_id)
                    seen_distributors.add(dist_id)

            hierarchy.append(brand_data)

        # FIXED: Correct filtering by role
        all_super_stockists = {
            d['name'] for d in all_distributors if d['super_stockist__distributor'] == "Super Stockiest"
        }
        all_normal_distributors = {
            d['name'] for d in all_distributors if d['super_stockist__distributor'] == "Distributor"
        }

        unassigned_super_stockists = list(all_super_stockists - seen_super_stockists)
        unassigned_distributors = list(all_normal_distributors - seen_distributors)

        people = []
        for pid in people_set.union(all_super_stockists).union(all_normal_distributors):
            dist = distributor_dict.get(pid)
            if dist:
                people.append({
                    "id": pid,
                    "name": dist.company_name
                })

        return {
            "brands": hierarchy,
            "unassigned_super_stockists": unassigned_super_stockists,
            "unassigned_distributors": unassigned_distributors,
            "people": people,
            "success": True
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_company_hierarchy error")
        return {
            "brands": [],
            "unassigned_super_stockists": [],
            "unassigned_distributors": [],
            "people": [],
            "success": False,
            "error": str(e)
        }


@frappe.whitelist()
def add_super_stockist_to_manufacturer(manufacturer, super_stockist):
    if not (manufacturer and super_stockist):
        return {"success": False, "error": "Missing required parameters."}

    try:
        if frappe.db.exists("Manufactuer Distributor Mapping", {
            "manufacturer": manufacturer,
            "distributor": super_stockist
        }):
            return {"success": False, "error": "Already mapped."}

        frappe.get_doc({
            "doctype": "Manufactuer Distributor Mapping",
            "manufacturer": manufacturer,
            "distributor": super_stockist
        }).insert()

        return {"success": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Add SS Mapping Error")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def add_distributor_to_manufacturer(manufacturer, distributor):
    if not (manufacturer and distributor):
        return {"success": False, "error": "Missing required parameters."}

    try:
        if frappe.db.exists("Manufactuer Distributor Mapping", {
            "manufacturer": manufacturer,
            "distributor": distributor
        }):
            return {"success": False, "error": "Already mapped."}

        frappe.get_doc({
            "doctype": "Manufactuer Distributor Mapping",
            "manufacturer": manufacturer,
            "distributor": distributor
        }).insert()

        return {"success": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Add Dist Mapping Error")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def add_distributor_to_stockist(stockiest, distributor):
    if not (stockiest and distributor):
        return {"success": False, "error": "Missing required parameters."}

    try:
        if frappe.db.exists("Stockiest Distributor Mapping", {
            "stockiest": stockiest,
            "distributor": distributor
        }):
            return {"success": False, "error": "Already mapped."}

        frappe.get_doc({
            "doctype": "Stockiest Distributor Mapping",
            "stockiest": stockiest,
            "distributor": distributor
        }).insert()

        return {"success": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Add Stockist Mapping Error")
        return {"success": False, "error": str(e)}

import frappe

@frappe.whitelist()
def cancel_and_delete_docs(doctype, docnames):
    """
    Cancel and delete submitted documents.
    """
    import json
    if isinstance(docnames, str):
        docnames = json.loads(docnames)

    deleted = []
    failed = []

    for name in docnames:
        try:
            doc = frappe.get_doc(doctype, name)

            if doc.docstatus == 1:
                doc.cancel()

            doc.delete()
            deleted.append(name)
        except Exception as e:
            failed.append({"name": name, "error": str(e)})

    return {
        "deleted": deleted,
        "failed": failed
    }

import frappe
from frappe.utils import get_url_to_form

def notify(doc, method=None):
    #frappe.msgprint(method)
    # if not hasattr(doc, "workflow_state"):
    #     return
    
    if doc.workflow_state == "Submitted":
        frappe.log_error("entered submit")
        send_to_approvers(doc)
    if doc.workflow_state == 'Approved':
        frappe.log_error("entered remmit")
        send_to_remitter(doc)
    if doc.workflow_state in ["Reimbursed", "Rejected"]:
        send_to_submitter(doc)

def send_to_approvers(doc):
    users = frappe.get_all("Has Role", filters={"role": "Expense Approver"}, fields=["parent"])
    emails = [user.parent for user in users if frappe.db.get_value("User", user.parent, "enabled")]

    if not emails:
        return

    link = get_url_to_form(doc.doctype, doc.name)
    subject = f"New Expense Submitted: {doc.name}"
    message = f"""
        A new expense has been submitted by <b>{doc.submitted_by}</b>.<br><br>
        <a href="{link}">Click here to review the document</a>.
    """

    frappe.sendmail(recipients=emails, subject=subject, message=message)
    frappe.msgprint("Notification sent to approvers")
    
def send_to_remitter(doc):
    users = frappe.get_all("Has Role", filters={"role": "Expense Remitter"}, fields=["parent"])
    emails = [user.parent for user in users if frappe.db.get_value("User", user.parent, "enabled")]

    if not emails:
        return

    link = get_url_to_form(doc.doctype, doc.name)
    subject = f"New Expense Approved: {doc.name}"
    message = f"""
        A new expense has been approved by</b>.<br><br>
        <a href="{link}">Click here to review the document</a>.
    """

    frappe.sendmail(recipients=emails, subject=subject, message=message)
    frappe.msgprint("Notification sent to Remitter")

def send_to_submitter(doc):
    if not doc.submitted_by:
        return

    email = frappe.db.get_value("User", doc.submitted_by, "email")
    if not email:
        return

    link = get_url_to_form(doc.doctype, doc.name)

    if doc.workflow_state == "Reimbursed":
        subject = f"Your Expense {doc.name} has been Reimbursed"
        message = f"""
            Your submitted expense <b>{doc.name}</b> has been approved and marked as <b>Reimbursed</b>.<br><br>
            <a href="{link}">Click here to view the document</a>.
        """
    elif doc.workflow_state == "Rejected":
        subject = f"Your Expense {doc.name} has been Rejected"
        message = f"""
            Your submitted expense <b>{doc.name}</b> has been <b>Rejected</b>.<br><br>
            <a href="{link}">Click here to view the document</a>.
        """
    else:
        return

    frappe.sendmail(recipients=[email], subject=subject, message=message)

def capture_previous_state(doc, method=None):
    doc.previous_workflow_state = frappe.db.get_value(doc.doctype, doc.name, "workflow_state")

@frappe.whitelist(allow_guest=True)
def get_all_users_with_role(role):
    """
    Get all users with a specific role.
    """
    if not role:
        return []

    users = frappe.get_all("Has Role", filters={"role": role}, fields=["parent"])
    user_emails = []

    for user in users:
        email = frappe.db.get_value("User", user.parent, "email")
        if email:
            user_emails.append(email)

    return user_emails

@frappe.whitelist(allow_guest=True)
def get_user():
    user=frappe.get_all("User", filters={"enabled": 1}, fields=["name", "email"])
    return user