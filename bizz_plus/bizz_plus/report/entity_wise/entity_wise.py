# Copyright (c) 2025, sandip.pandit and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from collections import defaultdict
from frappe.utils import flt, time_diff, now, today, add_days, getdate, get_first_day, get_last_day, get_year_start, get_year_ending, add_to_date
from pypika import Order

def execute(filters=None):
	columns = get_columns(filters)

	data = get_data(filters)

	report_summary = None
	if filters.get("report_type") in ["Payments", "Invoice"]:
		commission = payment = 0

		for row in data:
			commission += flt(row.get("commission"), 2)
			payment += flt(row.get("amount"), 2)

		report_summary = [
			{"value": payment, "label": "Total Amount", "datatype": "Currency", "currency": "INR", "indicator": "Red"},
			{"value": commission, "label": "Commission", "datatype": "Currency", "currency": "INR", "indicator": "Green"},
		]

	return columns, data, None, None, report_summary

def get_data(filters):
	leads = get_leads(filters)

	from_date, to_date = get_date_range(filters.get("date_range"))

	data = []
	if leads and filters.get("report_type") == "Payments":
		data = get_payments(filters, leads, from_date, to_date)

	if leads and filters.get("report_type") == "Invoice":
		data = get_invoices(filters, leads, from_date, to_date)

	if leads and filters.get("report_type") == "Bizz Interaction":
		data = get_bizz_interactions(filters, leads, from_date, to_date)

	if leads and filters.get("report_type") == "Lead Interaction":
		data = get_lead_interactions(filters, leads, from_date, to_date)

	if leads and filters.get("report_type") == "Status Changes":
		data = get_status_changes(filters, leads, from_date, to_date)

	return data

def get_date_range(timeline):
	today = getdate()
	from_date = today
	to_date = today

	if timeline == "Yesterday":
		from_date = add_days(today, -1)
		to_date = add_days(today, -1)

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

def get_leads(filters):
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

	return leads

def get_payments(filters, leads, from_date, to_date):
	lm = frappe.qb.DocType("Lead Mapping")
	lmp = frappe.qb.DocType("Lead Mapping Payment")

	data = []
	query = (
		frappe.qb.from_(lm)
		.inner_join(lmp)
		.on(lmp.parent == lm.name)
		.select(
			lm.name,
			lm.parent_lead,
			lm.mapped_lead,
			lm.parent_lead_name.as_("manufacturer"),
			lm.mapped_lead_name.as_("distributor"),
			lm.status,
			lm.last_date,
			lm.last_status_change,
			lmp.commission_amount.as_("commission"),
			lmp.amount.as_("payment_amount"),
			lmp.payment_by_name.as_("payment_by"),
			lmp.creation
		)
		.where(lm.last_status_change.between(from_date, to_date))
		.orderby(lm.last_status_change, order=Order.asc)
	)

	if filters.get("category") == "Distributor":
		query = query.where(lm.mapped_lead.isin(leads))

	if filters.get("category") == "Manufacturer":
		query = query.where(lm.parent_lead.isin(leads))

	lead_mappings = query.run(as_dict=True)

	for mapping in lead_mappings:
		data.append({
			"manufacturer": mapping.manufacturer,
			"distributor": mapping.distributor,
			"status": mapping.status,
			"entered_by": mapping.payment_by,
			"time_elapsed": time_diff(now(), mapping.last_status_change).days,
			"commission": mapping.commission or 0,
			"amount": mapping.payment_amount or 0,
			"status_date": mapping.last_date,
			"payment_date": mapping.creation
		})

	return data

def get_columns(filters):
	if filters.get("report_type") == "Payments":
		return [
			_("Manufacturer")+":Data:200",
			_("Distributor")+":Data:200",
			_("Status")+":Data:150",
			_("Entered By")+":Data:150",
			_("Status Date")+":Datetime:200",
			_("Time Elapsed")+":Int:150",
			_("Payment Date")+":Date:150",
			_("Commission")+":Currency:150",
			_("Amount")+":Currency:150",
		]
	elif filters.get("report_type") == "Invoice":
		return [
			_("Manufacturer")+":Data:200",
			_("Distributor")+":Data:200",
			_("Status")+":Data:150",
			_("Entered By")+":Data:150",
			_("Status Date")+":Datetime:200",
			_("Time Elapsed")+":Int:150",
			_("Invoice Date")+":Date:150",
			_("Commission")+":Currency:150",
			_("Amount")+":Currency:150",
		]
	elif filters.get("report_type") == "Lead Interaction":
		return [
			_("Manufacturer")+":Data:200",
			_("Distributor")+":Data:200",
			_("Status")+":Data:150",
			_("Status Date")+":Datetime:200",
			_("Time Elapsed")+":Int:150",
			_("Assigned By")+":Data:150",
			_("Assigned To")+":Data:150",
			_("Notes")+":Small Text:250",
		]
	elif filters.get("report_type") == "Status Changes":
		return [
			_("Manufacturer")+":Data:200",
			_("Distributor")+":Data:200",
			_("Status")+":Data:150",
			_("Status Changed By")+":Data:150",
			_("Status Date")+":Datetime:200",
			_("Time Elapsed")+":Int:150",
		]
	else:
		return [
			_("Lead")+":Data:200",
			_("Status")+":Data:150",
			_("Status Date")+":Datetime:200",
			_("Time Elapsed")+":Int:150",
			_("Assigned By")+":Data:150",
			_("Assigned To")+":Data:150",
			_("Notes")+":Small Text:250",
		]

def get_bizz_interactions(filters, leads, from_date, to_date):
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
			bi.posting_datetime,
			bi.notes
		)
		.where(
			bi.lead.isin(leads)
			& bi.posting_date.between(from_date, to_date)
		)
	).run(as_dict=True)

	for interaction in bizz_interactions:
		data.append({
				"lead": interaction.lead_name,
				"status": interaction.status,
				"assigned_by": interaction.assigned_by_name,
				"assigned_to": interaction.assigned_to_name,
				"time_elapsed": time_diff(now(), interaction.posting_date).days,
				"notes": interaction.notes,
				"status_date": interaction.posting_datetime,
			})

	return data

def get_lead_interactions(filters, leads, from_date, to_date):
	data = []
	li = frappe.qb.DocType("Lead Interaction")

	query = (
		frappe.qb.from_(li)
		.select(
			li.parent_lead_name.as_("manufacturer"),
			li.mapped_lead_name.as_("distributor"),
			li.lead_owner_name.as_("assigned_by"),
			li.assigned_to_name.as_("assigned_to"),
			li.status,
			li.posting_date,
			li.posting_datetime,
			li.interaction_notes
		)
		.where(li.posting_date.between(from_date, to_date))
	)

	if filters.get("category") == "Distributor":
		query = query.where(li.mapped_lead.isin(leads))

	if filters.get("category") == "Manufacturer":
		query = query.where(li.parent_lead.isin(leads))

	lead_interactions = query.run(as_dict=True)

	for interaction in lead_interactions:
		data.append({
			"manufacturer": interaction.manufacturer,
			"distributor": interaction.distributor,
			"status": interaction.status,
			"assigned_by": interaction.assigned_by,
			"assigned_to": interaction.assigned_to,
			"time_elapsed": time_diff(now(), interaction.posting_date).days,
			"notes": interaction.interaction_notes,
			"status_date": interaction.posting_datetime,
		})

	return data

def get_invoices(filters, leads, from_date, to_date):
	lm = frappe.qb.DocType("Lead Mapping")
	lmti = frappe.qb.DocType("Lead Mapping Tax Invoice")

	data = []
	query = (
		frappe.qb.from_(lm)
		.inner_join(lmti)
		.on(lmti.parent == lm.name)
		.select(
			lm.name,
			lm.parent_lead,
			lm.mapped_lead,
			lm.parent_lead_name.as_("manufacturer"),
			lm.mapped_lead_name.as_("distributor"),
			lm.status,
			lm.last_date,
			lm.last_status_change,
			lmti.commission_amount.as_("commission"),
			lmti.amount.as_("invoice_amount"),
			lmti.invoice_by_name.as_("invoiced_by"),
			lmti.creation
		)
		.where(lm.last_status_change.between(from_date, to_date))
		.orderby(lm.last_status_change, order=Order.asc)
	)

	if filters.get("category") == "Distributor":
		query = query.where(lm.mapped_lead.isin(leads))

	if filters.get("category") == "Manufacturer":
		query = query.where(lm.parent_lead.isin(leads))

	lead_mappings = query.run(as_dict=True)

	for mapping in lead_mappings:
		data.append({
			"manufacturer": mapping.manufacturer,
			"distributor": mapping.distributor,
			"status": mapping.status,
			"entered_by": mapping.invoiced_by,
			"time_elapsed": time_diff(now(), mapping.last_status_change).days,
			"commission": mapping.commission or 0,
			"amount": mapping.invoice_amount or 0,
			"status_date": mapping.last_date,
			"invoice_date": mapping.creation
		})

	return data

def get_status_changes(filters, leads, from_date, to_date):
	lm = frappe.qb.DocType("Lead Mapping")

	data = []
	query = (
		frappe.qb.from_(lm)
		.select(
			lm.name,
			lm.parent_lead_name.as_("manufacturer"),
			lm.mapped_lead_name.as_("distributor"),
			lm.status,
			lm.last_date,
			lm.last_status_change,
			lm.verified_owner,
			lm.lead_owner,
			lm.prospect_owner,
			lm.customer_owner
		)
		.where(lm.last_status_change.between(from_date, to_date))
		.orderby(lm.last_status_change, order=Order.asc)
	)

	if filters.get("category") == "Distributor":
		query = query.where(lm.mapped_lead.isin(leads))

	if filters.get("category") == "Manufacturer":
		query = query.where(lm.parent_lead.isin(leads))

	lead_mappings = query.run(as_dict=True)

	for mapping in lead_mappings:
		status_changed = mapping.verified_owner

		if mapping.status == "Lead":
			status_changed = mapping.lead_owner

		if mapping.status == "Prospect":
			status_changed = mapping.prospect_owner

		if mapping.status == "Customer":
			status_changed = mapping.customer_owner
   
		status_changed = frappe.get_doc("User", status_changed).full_name

		data.append({
			"manufacturer": mapping.manufacturer,
			"distributor": mapping.distributor,
			"status": mapping.status,
			"status_changed_by": status_changed,
			"time_elapsed": time_diff(now(), mapping.last_status_change).days,
			"status_date": mapping.last_date
		})

	return data