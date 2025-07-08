# Copyright (c) 2025, sandip.pandit and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class ExpenseEntry(Document):
    def before_submit(self):
        self.submitted_on = now_datetime()
    def on_update(self):
        if self.workflow_state=='Approved':
            self.expense_approved_by=frappe.session.user

