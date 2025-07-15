// Copyright (c) 2025, sandip.pandit and contributors
// For license information, please see license.txt

frappe.ui.form.on("Manufacturer Company", {
	refresh(frm) {
        frm.set_query("manufacturer", function() {
            return {
                filters: {
                    custom_lead_category: "Manufacturer Lead",
                    workflow_state:"Converted"
                }
            };
        });
       
    }
});
