import frappe, base64
from frappe.utils import now
from frappe.utils.file_manager import get_file_path

def before_save(doc, action):
	if doc.agreement:
		doc.custom_file_uploaded = 1

	if doc.is_new():
		return

	create_lead_mappings(doc)

	if doc.custom_catalogue or doc.agreement:
		encode_documents(doc)


def after_insert(doc, action):
	if doc.agreement:
		doc.custom_file_uploaded = 1

	create_lead_mappings(doc)

def create_lead_mappings(doc):
	if doc.custom_new_status == "Verified" and doc.has_value_changed("custom_new_status"):
		if doc.custom_super_stockiest_or_distributor and doc.custom_super_stockiest_or_distributor == "Distributor":
			manufacturers = frappe.get_list("Lead", {"custom_super_stockiest_or_distributor": ["!=", "Distributor"], "custom_new_status": "Verified"}, ["name", "title"])
			for row in manufacturers:
				if not frappe.db.exists("Lead Mapping", {"parent_lead": row.get("name"), "mapped_lead": doc.name}):
					frappe.get_doc(
						{
							"doctype": "Lead Mapping",
							"parent_lead": row.get("name"), # manufacturer
							"mapped_lead": doc.name, # distributor
							"verified_owner": doc.lead_owner,
							"verified_date": now(),
							"parent_lead_name": row.get("title"),
							"mapped_lead_name": doc.title
						}
					).insert(ignore_mandatory=True, ignore_permissions=True)

		else:
			distributors = frappe.get_list("Lead", {"custom_super_stockiest_or_distributor": "Distributor", "custom_new_status": "Verified"}, ["name", "title"])
			for row in distributors:
				if not frappe.db.exists("Lead Mapping", {"parent_lead": doc.name, "mapped_lead": row.get("name")}):
					frappe.get_doc(
						{
							"doctype": "Lead Mapping",
							"parent_lead": doc.name, # manufacturer
							"mapped_lead":row.get("name"), # distributor
							"verified_owner": doc.lead_owner,
							"verified_date": now(),
							"parent_lead_name": doc.title,
							"mapped_lead_name": row.get("title")
						}
					).insert(ignore_mandatory=True, ignore_permissions=True)

def encode_documents(doc):
	if doc.custom_catalogue:
		with open(get_file_path(doc.custom_catalogue), 'rb') as pdf_file:
				pdf_content = pdf_file.read()

		doc.custom_catalogue_code = base64.b64encode(pdf_content)

	if doc.agreement:
		with open(get_file_path(doc.agreement), 'rb') as pdf_file:
				pdf_content = pdf_file.read()

		doc.custom_agreement_code = base64.b64encode(pdf_content)