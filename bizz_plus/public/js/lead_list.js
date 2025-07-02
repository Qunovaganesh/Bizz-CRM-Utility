frappe.listview_settings["Lead"] = {
	get_indicator: function (doc) {
		var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
		return indicator;
	},

	onload: function (listview) {
		// Add custom 'Create Prospect' button
		// if (frappe.boot.user.can_create.includes("Prospect")) {
		// 	listview.page.add_action_item(__("Create Prospect"), function () {
		// 		frappe.model.with_doctype("Prospect", function () {
		// 			let prospect = frappe.model.get_new_doc("Prospect");
		// 			let leads = listview.get_checked_items();

		// 			frappe.db.get_value(
		// 				"Lead",
		// 				leads[0].name,
		// 				[
		// 					"company_name",
		// 					"no_of_employees",
		// 					"industry",
		// 					"market_segment",
		// 					"territory",
		// 					"fax",
		// 					"website",
		// 					"lead_owner",
		// 				],
		// 				(r) => {
		// 					prospect.company_name = r.company_name;
		// 					prospect.no_of_employees = r.no_of_employees;
		// 					prospect.industry = r.industry;
		// 					prospect.market_segment = r.market_segment;
		// 					prospect.territory = r.territory;
		// 					prospect.fax = r.fax;
		// 					prospect.website = r.website;
		// 					prospect.prospect_owner = r.lead_owner;

		// 					leads.forEach(function (lead) {
		// 						let lead_prospect_row = frappe.model.add_child(prospect, "leads");
		// 						lead_prospect_row.lead = lead.name;
		// 					});
		// 					frappe.set_route("Form", "Prospect", prospect.name);
		// 				}
		// 			);
		// 		});
		// 	});
		// }

		// ✅ Add Delete Button
		// listview.page.add_action_item(__("Delete"), function () {
		// 	let selected = listview.get_checked_items();

		// 	if (!selected.length) {
		// 		frappe.msgprint(__('Please select at least one record to delete.'));
		// 		return;
		// 	}

		// 	let names = selected.map(d => d.name);

		// 	frappe.confirm(
		// 		__('Are you sure you want to delete {0} Lead(s)?', [names.length]),
		// 		function () {
		// 			frappe.call({
		// 				method: "frappe.desk.reportview.delete_items",
		// 				args: {
		// 					doctype: "Lead",
		// 					names: JSON.stringify(names)  // ✅ This line fixes the JSON issue
		// 				},
		// 				callback: function () {
		// 					frappe.msgprint(__('Deleted successfully.'));
		// 					listview.refresh();
		// 				}
		// 			});
		// 		}
		// 	);
		// });

		listview.page.add_action_item(__("Delete"), function () {
    // Get selected documents from the list view
    let selected = listview.get_checked_items();

    // Show message if nothing is selected
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
                    doctype: "Lead",
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

	}
};


