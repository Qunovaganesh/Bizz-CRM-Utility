frappe.listview_settings["BizzPlus Expenses utility"] = {
	get_indicator: function (doc) {
		var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
		return indicator;
	},

	onload: function (listview) {
		listview.page.add_action_item(__("Delete"), function () {
    let selected = listview.get_checked_items();

    if (!selected.length) {
        frappe.msgprint(__('Please select at least one record to delete.'));
        return;
    }

    // Extract names (primary keys) from selected items
    let names = selected.map(d => d.name);

    // Show confirmation prompt
    frappe.confirm(
        __('Are you sure you want to delete {0} Lead(s)?', [names.length]),
        function () {
            // Call Frappe delete_items API
            frappe.call({
                method: "frappe.desk.reportview.delete_items",
                args: {
                    doctype: "BizzPlus Expenses utility",
                    items: names  // You do NOT need to JSON.stringify this
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

