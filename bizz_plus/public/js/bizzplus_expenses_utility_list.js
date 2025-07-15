frappe.listview_settings["BizzPlus Expenses utility"] = {
    get_indicator: function (doc) {
        return [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
    },

    // ✅ Override the create button label
    get_create_label: function () {
        return __("➕ New Expense Entry"); // <-- Change this label here
    },

    onload: function (listview) {
        console.log("✅ Custom ListView JS Loaded");
        listview.page.add_action_item(__("Delete"), function () {
            let selected = listview.get_checked_items();
            if (!selected.length) {
                frappe.msgprint(__('Please select at least one record to delete.'));
                return;
            }

            let names = selected.map(d => d.name);

            frappe.confirm(
                __('Are you sure you want to delete {0} record(s)?', [names.length]),
                function () {
                    frappe.call({
                        method: "frappe.desk.reportview.delete_items",
                        args: {
                            doctype: "BizzPlus Expenses utility",
                            items: names
                        },
                        callback: function (r) {
                            if (!r.exc) {
                                frappe.msgprint(__('Deleted successfully.'));
                                listview.refresh();
                            }
                        }
                    });
                }
            );
        });

        listview.page.add_action_item(__("Cancel + Delete"), function () {
            let selected = listview.get_checked_items();

            if (!selected.length) {
                frappe.msgprint(__('Please select at least one record to delete.'));
                return;
            }

            let names = selected.map(d => d.name);

            frappe.confirm(
                __('Are you sure you want to cancel and delete {0} record(s)?', [names.length]),
                function () {
                    frappe.call({
                        method: "bizz_plus.api.pincode_api.cancel_and_delete_docs",
                        args: {
                            doctype: "BizzPlus Expenses utility",
                            docnames: names
                        },
                        callback: function (r) {
                            if (!r.exc) {
                                frappe.msgprint(__("✅ Deleted {0} items successfully", [
                                    r.message.deleted.length,
                                    r.message.failed.length
                                ]));
                                listview.refresh();
                            }
                        }
                    });
                }
            );
        });
    }
};


function change_submit_button_label(frm) {
// Wait for the document to be ready
$(document).ready(function () {
// Determine if the document is new or existing
const label = frm.is_new() ? 'Add new expense' : 'Update';

    // Find the button by its class and data-label attribute
    $("button.btn-primary.primary-action[data-label='Add BizzPlus Expenses utility']").each(function () {
        // Change the label inside the <span> to the desired value
        $(this).find("span").html(label);
    });
});
}