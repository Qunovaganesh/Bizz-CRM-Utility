# Copyright (c) 2025, sandip.pandit and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LeadMapping(Document):
	def before_save(self):
		if self.has_value_changed("status"):
			if self.customer_date:
				self.last_date = self.customer_date

			elif self.prospect_date:
				self.last_date = self.prospect_date

			elif self.lead_date:
				self.last_date = self.lead_date

			elif self.verified_date:
				self.last_date = self.verified_date
    
			self.last_status_change = self.last_date