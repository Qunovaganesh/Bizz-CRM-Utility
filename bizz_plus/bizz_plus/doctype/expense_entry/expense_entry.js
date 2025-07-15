// Copyright (c) 2025, sandip.pandit and contributors
// For license information, please see license.txt

frappe.ui.form.on("Expense Entry", {
    submitted_by: function (frm) {
    if (frm.doc.submitted_by) {
    frappe.db.get_value("Employee", { user_id: frm.doc.submitted_by }, "custom_employee_grade", function (r) {
      if (r) {
        console.log(r.custom_employee_grade);
        frm.set_value("grade", r.custom_employee_grade);
      } else {
        console.warn("custom_employee_grade not found", r);
        frappe.msgprint("⚠️ No grade found for the user.");
      }
    });
  }
  },
    onload: function (frm) {
    const is_system_manager = frappe.user.has_role("System Manager") || frappe.user.has_role("Administrator");

    // Always make it editable first
    frm.set_df_property("submitted_by", "read_only", false);

    if (!is_system_manager) {
        frm.fields_dict["expense_head"].grid.cannot_delete_rows = true;
        frm.fields_dict["expense_head"].grid.cannot_reorder_rows = true;

        if (!frm.doc.submitted_by) {
            frm.set_value("submitted_by", frappe.session.user);
        }

        frm.set_df_property("submitted_by", "read_only", true);
    }

    if (frm.doc.docstatus === 0 && !frm.doc.submitted_on && !frm.is_new()) {
        frm.set_value("submitted_on", frappe.datetime.now_datetime());
    }
}
,

    refresh: function (frm) {
        if(frm.doc.workflow_state !=="Draft")
            {
        setTimeout(() => {
            $('use[href="#icon-setting-gear"], use[href="#icon-edit"]').css('display', 'none');
        }, 300)
    }

        const is_system_manager = frappe.user.has_role("System Manager");
        frm.set_df_property("submitted_by", "read_only", !is_system_manager);

        // Optional: reset submitted_on again in refresh, if still in Draft and unset
        if (frm.doc.docstatus === 0 && !frm.doc.submitted_on) {
            frm.set_value("submitted_on", frappe.datetime.now_datetime());
        }
    }
});

let last_expense_alert_time = null;

frappe.ui.form.on('Expense Head', {
  amount: function (frm, cdt, cdn) {
    let total = 0;
    (frm.doc.expense_head || []).forEach(child => {
      total += child.amount || 0;
    });
    frm.set_value("total_amount", total);

    let row = locals[cdt][cdn];
    if (row.expense_line_item) {
      validate_cap_in_child(frm, cdt, cdn, row.expense_line_item, row.amount);
    }
  },

  expense_line_item: function (frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (row.amount) {
      validate_cap_in_child(frm, cdt, cdn, row.expense_line_item, row.amount);
    }
  },

  expense_date: function (frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    if (!row.expense_date) return;

    let expenseDate = new Date(row.expense_date);
    let today = new Date();

    let timeDiff = today - expenseDate;
    let dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (dayDiff > 60) {
      let now = new Date().getTime();
      if (!last_expense_alert_time || (now - last_expense_alert_time > 2000)) {
        frappe.msgprint("❌ You can't claim expense older than 60 days.");
        last_expense_alert_time = now;
      }

      frappe.model.set_value(cdt, cdn, "expense_date", null);
    }
  }
});


function validate_cap_in_child(frm, cdt, cdn, item_code, amount) {
  if (!frm.doc.submitted_by) {
    frappe.msgprint("Submitted By is required.");
    return;
  }

  frappe.db.get_value("Employee", { user_id: frm.doc.submitted_by }, "custom_employee_grade", function (r) {
    if (r && r.custom_employee_grade) {
      const grade = r.custom_employee_grade;
      frm.set_value("grade", grade);
      console.log("Grade:", grade);

      // Get cap for that grade and item
      frappe.db.get_value("Expense Cap", {
        grade: grade,
        expense_type: item_code
      }, "cap", function (res) {
        if (res && res.cap !== undefined) {
          let cap = res.cap;
          if (amount > cap) {
            frappe.msgprint(`❌ Amount exceeds cap of ₹${cap}`);
            frappe.model.set_value(cdt, cdn, "amount", cap);
            frm.clear_field("total_amount");
            (frm.doc.expense_head || []).forEach(child => {
              total += child.amount || 0;
            });
            frm.set_value("total_amount", total);
          } else {
            frappe.msgprint(`✅ Amount within cap of ₹${cap}`);
          }
        } else {
          // frappe.msgprint("⚠️ No cap found for this grade and item.");
        }
      });
    } else {
      // frappe.msgprint("⚠️ No grade found for the user.");
    }
  });
}


function recalculate_total(frm, cdt, cdn){
    let total = 0;
    (frm.doc.expense_head || []).forEach(child => {
      total += child.amount || 0;
    });
    frm.set_value("total_amount", total);

    let row = locals[cdt][cdn];
    if (row.expense_line_item) {
      validate_cap_in_child(frm, cdt, cdn, row.expense_line_item, row.amount);
    }
  
}