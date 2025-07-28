# Copyright (c) 2025, sandip.pandit and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LeadInteraction(Document):
    def before_insert(self):
        subject = f"Lead Interaction Reminder - {self.reminder_date}"
        
        if self.lead_owner == self.assigned_to:
            message = f"Here is a reminder set by yourself"
            
            frappe.sendmail(recipients=[self.lead_owner], subject=subject, message=message)