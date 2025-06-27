// Copyright (c) 2025, sandip.pandit and contributors
// For license information, please see license.txt

frappe.ui.form.on("Stockiest Distributor Mapping", {
	refresh(frm) {
		// Filter for Stockiest field
		frm.set_query("stockiest", function () {
			return {
				filters: {
					super_stockist__distributor: "Super Stockiest"
				}
			};
		});

		// Filter for Distributor field
		frm.set_query("distributor", function () {
			return {
				filters: {
					super_stockist__distributor: "Distributor"
				}
			};
		});
	},
});

