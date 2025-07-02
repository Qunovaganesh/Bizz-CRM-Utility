// Copyright (c) 2025, sandip.pandit and contributors
// For license information, please see license.txt

frappe.ui.form.on("BizzPlus Expenses utility", {
    onload: function (frm) {
        const is_system_manager = frappe.user.has_role("System Manager");

        frm.set_df_property("submitted_by", "read_only", !is_system_manager);

        if (!is_system_manager && !frm.doc.submitted_by) {
            frm.set_value("submitted_by", frappe.session.user);
        }

        if (frm.doc.docstatus === 0 && !frm.doc.submitted_on && !frm.is_new()) {
            frm.set_value("submitted_on", frappe.datetime.now_datetime());
        }
    },

    refresh: function (frm) {
        const is_system_manager = frappe.user.has_role("System Manager");
        frm.set_df_property("submitted_by", "read_only", !is_system_manager);

        // Optional: reset submitted_on again in refresh, if still in Draft and unset
        if (frm.doc.docstatus === 0 && !frm.doc.submitted_on) {
            frm.set_value("submitted_on", frappe.datetime.now_datetime());
        }
    }
});

frappe.ui.form.on('Expense Head', {
    amount: function(frm, cdt, cdn) {
        let total = 0;
        (frm.doc.expense_head || []).forEach(child => {
            total += child.amount || 0;
        });
        frm.set_value("total_amount", total);
    }
});
