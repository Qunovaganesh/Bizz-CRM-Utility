// // Copyright (c) 2025, sandip.pandit and contributors
// // For license information, please see license.txt

frappe.ui.form.on("Distributor Company", {
	refresh(frm) {
        frm.set_query("distributor", function() {
            return {
                filters: {
                     custom_lead_category: "SS / Distributor Lead",
                        workflow_state:"Converted"
                }
            };
        });
	},
});
