from erpnext.crm.doctype.lead.lead import Lead


class customLead(Lead)
def set_lead_name(self):
    pass
		# if not self.lead_name:
		# 	# Check for leads being created through data import
		# 	if not self.company_name and not self.email_id and not self.flags.ignore_mandatory:
		# 		frappe.throw(_("A Lead requires either a person's name or an organization's name"))
		# 	elif self.company_name:
		# 		self.lead_name = self.company_name
		# 	else:
		# 		self.lead_name = self.email_id.split("@")[0]