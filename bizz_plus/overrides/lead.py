import frappe
from erpnext.crm.doctype.lead.lead import Lead as ERPNextLead

class CustomLead(ERPNextLead):
    def after_save(self):
        if self.custom_lead_category=="SS / Distributor Lead":
            self.title=self.custom_distributor_company_name
    def validate(self):
        super().validate()
        

    #     # Custom validation for Distributor
    #     if self.workflow_state == "Converted" and self.cutomrlead_type == "Distributor":
    #         if not self.proforma_invoice:
    #             frappe.throw("Please upload the Proforma Invoice before converting this Distributor.")
    
    def set_lead_name(self):
        # frappe.msgprint("triggered")
        pass
		# if not self.lead_name:
		# 	# Check for leads being created through data import
		# 	if not self.company_name and not self.email_id and not self.flags.ignore_mandatory:
		# 		frappe.throw(_("A Lead requires either a person's name or an organization's name"))
		# 	elif self.company_name:
		# 		self.lead_name = self.company_name
		# 	else:
		# 		self.lead_name = self.email_id.split("@")[0]
