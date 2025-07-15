frappe.listview_settings["Expense Entry"] = {
    get_indicator: function (doc) {
        return [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
    },

    get_create_label: function () {
        return __("➕ New Expense Entry");
    },

    onload: function (listview) {
        // ✅ Workflow button click - Refresh after a short delay
        listview.page.wrapper.on("click", ".btn-workflow", function () {
            setTimeout(() => {
                listview.refresh();
            }, 1200);
        });

        // ✅ Realtime update refresh
        frappe.realtime.on("doc_update", function (data) {
            if (data && data.doctype === "Expense Entry") {
                listview.refresh();
            }
        });

        frappe.realtime.on("doc_deleted", function (data) {
            if (data && data.doctype === "Expense Entry") {
                listview.refresh();
            }
        });

        // ✅ Delete action
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
                            doctype: "Expense Entry",
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

        // ✅ Cancel + Delete action
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
                            doctype: "Expense Entry",
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

// 🔘 Submit button label change (use this in `frappe.ui.form.on('Expense Entry')` if needed)
function change_submit_button_label(frm) {
    $(document).ready(function () {
        const label = frm.is_new() ? 'Add new expense' : 'Update';
        $("button.btn-primary.primary-action[data-label='Add Expense Entry']").each(function () {
            $(this).find("span").html(label);
        });
    });
}
