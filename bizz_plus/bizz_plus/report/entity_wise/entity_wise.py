# Copyright (c) 2025, sandip.pandit and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from collections import defaultdict
from frappe.utils import flt, time_diff, now, today, add_days, getdate, get_first_day, get_last_day, get_year_start, get_year_ending, add_to_date
from pypika import Order

def execute(filters=None):
	columns = [
		_("Manufacturer")+":Data:200",
		_("Distributor")+":Data:200",
		_("Status")+":Data:150",
		_("Assigned By")+":Data:150",
		_("Assigned To")+":Data:150",
  		_("Status Date")+":Date:150",
		_("Time Elapsed")+":Int:150",
		_("Notes")+":Small Text:250",
		_("Commission")+":Currency:150",
		_("Invoice Amount")+":Currency:150",
		_("Payment Amount")+":Currency:150",
	]

	data = get_data(filters)

	customer = verified = prospect = lead = commission = invoice = payment = 0

	for row in data:
		if row.get("status") == "Customer":
			customer += 1

		if row.get("status") == "Verified":
			verified += 1

		if row.get("status") == "Prospect":
			prospect += 1

		if row.get("status") == "Lead":
			lead += 1

		commission += flt(row.get("commission"), 2)
		invoice += flt(row.get("invoice_amount"), 2)
		payment += flt(row.get("payment_amount"), 2)

	report_summary = [
		{"value": verified, "label": "Verified", "datatype": "Int"},
		{"value": lead, "label": "Lead", "datatype": "Int"},
		{"value": prospect, "label": "Prospect", "datatype": "Int"},
		{"value": customer, "label": "Customer", "datatype": "Int"},
		{"value": 0, "label": "View", "datatype": "Int"},
		{"value": commission, "label": "Commission", "datatype": "Currency", "currency": "INR", "indicator": "Green"},
		{"value": payment, "label": "Payment", "datatype": "Currency", "currency": "INR"},
		{"value": invoice, "label": "Invoice", "datatype": "Currency", "currency": "INR"},
	]

	return columns, data, None, None, report_summary

def get_data(filters):
	leads = [filters.get("lead")] if filters.get("lead") else []
	if not filters.get("lead"):
		category = "Manufacturer Lead"
		if filters.get("category") == "Distributor":
			category = "SS / Distributor Lead"

		lead = frappe.qb.DocType("Lead")

		query = (
			frappe.qb.from_(lead)
			.select(lead.name)
		)

		if filters.get("category") == "Distributor":
			query = query.where(lead.custom_lead_category == "SS / Distributor Lead")

			if filters.get("state"):
				query = query.where(lead.custom_dist_state == filters.get("state"))

			if filters.get("district"):
				query = query.where(lead.custom_dist_district0 == filters.get("district"))

		if filters.get("category") == "Manufacturer":
			query = query.where(lead.custom_lead_category == "Manufacturer Lead")

			if filters.get("state"):
				query = query.where(lead.custom_states == filters.get("state"))

			if filters.get("district"):
				query = query.where(lead.custom_districts == filters.get("district"))

		if filters.get("owner"):
			query = query.where(lead.lead_owner == filters.get("owner"))

		leads = query.run(as_dict=True)

		leads = [x.name for x in leads]

	lm = frappe.qb.DocType("Lead Mapping")
	lmp = frappe.qb.DocType("Lead Mapping Payment")
	lmti = frappe.qb.DocType("Lead Mapping Tax Invoice")

	from_date, to_date = get_date_range(filters.get("date_range"))
	data = []
	if leads and not filters.get("show_bizz_interaction"):
		query = (
			frappe.qb.from_(lm)
			.left_join(lmp)
			.on(lmp.parent == lm.name)
			.left_join(lmti)
			.on(lmti.parent == lm.name)
			.select(
				lm.name,
				lm.parent_lead,
				lm.mapped_lead,
				lm.parent_lead_name.as_("manufacturer"),
				lm.mapped_lead_name.as_("distributor"),
				lm.status,
				lm.last_date,
				lmp.commission_amount.as_("commission"),
				lmp.amount.as_("payment_amount"),
				lmti.amount.as_("invoice_amount")
			)
			.where(lm.last_date.between(from_date, to_date))
			.orderby(lm.last_date, order=Order.asc)
		)

		if filters.get("category") == "Distributor":
			query = query.where(lm.mapped_lead.isin(leads))

		if filters.get("category") == "Manufacturer":
			query = query.where(lm.parent_lead.isin(leads))

		lead_mappings = query.run(as_dict=True)

		lead_wise_map = defaultdict(list)

		for lead in lead_mappings:
			lead_wise_map[lead.name].append(lead)

		for key, value in lead_wise_map.items():
			manufacturer = distributor = status = last_date = None
			commission = payment = invoice = time_elapsed = 0
			parent_lead = mapped_lead = None
			for lead in value:
				manufacturer = lead.manufacturer
				distributor = lead.distributor
				status = lead.status
				commission += flt(lead.commission, 2)
				payment += flt(lead.payment_amount, 2)
				invoice += flt(lead.invoice_amount, 2)
				parent_lead = lead.parent_lead
				mapped_lead = lead.mapped_lead


			time_elapsed = time_diff(now(), lead.last_date).days

			assigned_to = assigned_by = notes = None
			if frappe.db.exists("Lead Interaction", {"parent_lead": parent_lead, "mapped_lead": mapped_lead}):
				lead_interaction = frappe.get_last_doc("Lead Interaction", {"parent_lead": parent_lead, "mapped_lead": mapped_lead})

				assigned_to = frappe.get_doc("User", lead_interaction.assigned_to).full_name
				assigned_by = frappe.get_doc("User", lead_interaction.lead_owner).full_name
				notes = lead_interaction.interaction_notes

			data.append({
				"manufacturer": manufacturer,
				"distributor": distributor,
				"status": status,
				"assigned_by": assigned_by,
				"assigned_to": assigned_to,
				"time_elapsed": time_elapsed,
				"commission": commission,
				"invoice_amount": invoice,
				"payment_amount": payment,
				"status_date": lead.last_date,
				"notes": notes
			})

	if leads and filters.get("show_bizz_interaction"):
		data = []
		bi = frappe.qb.DocType("Bizz Interaction")

		bizz_interactions = (
			frappe.qb.from_(bi)
			.select(
				bi.lead,
				bi.lead_name,
				bi.status,
				bi.assigned_by_name,
				bi.assigned_to_name,
				bi.company,
				bi.posting_date,
				bi.notes
			)
			.where(
       			bi.lead.isin(leads)
				& bi.posting_date.between(from_date, to_date)
          	)
		).run(as_dict=True)

		for interaction in bizz_interactions:
			time_elapsed = time_diff(now(), interaction.posting_date).days
			if filters.get("category") == "Manufacturer":
				data.append({
					"manufacturer": interaction.lead_name,
					"distributor": '',
					"status": interaction.status,
					"assigned_by": interaction.assigned_by_name,
					"assigned_to": interaction.assigned_to_name,
					"time_elapsed": time_elapsed,
					"notes": interaction.notes,
					"commission": 0,
					"invoice_amount": 0,
					"payment_amount": 0,
					"status_date": '',
				})
			else:
				data.append({
					"manufacturer": '',
					"distributor": interaction.lead_name,
					"status": interaction.status,
					"assigned_by": interaction.assigned_by_name,
					"assigned_to": interaction.assigned_to_name,
					"time_elapsed": time_elapsed,
					"notes": interaction.notes,
					"commission": 0,
					"invoice_amount": 0,
					"payment_amount": 0,
					"status_date": '',
				})

	return data

def get_date_range(timeline):
	today = getdate()
	from_date = today
	to_date = today

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