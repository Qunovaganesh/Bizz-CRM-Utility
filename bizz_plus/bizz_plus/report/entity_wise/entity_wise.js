// Copyright (c) 2025, sandip.pandit and contributors
// For license information, please see license.txt

frappe.query_reports["Entity Wise"] = {
	"filters": [
		{
			"label": "Category",
			"fieldname": "category",
			"fieldtype": "Select",
			"options": ["Distributor", "Manufacturer"],
			"default": "Distributor",
			"reqd": 1,
			onchange() {
				frappe.query_report.set_filter_value("lead", "");
				frappe.query_report.refresh();
			}
		},
		{
			"label": "Date Range",
			"fieldname": "date_range",
			"fieldtype": "Select",
			"options": [
				"Today",
				"Yesterday",
				"Last 7 Days",
				"Last 14 Days",
				"This Month",
				"Last Month",
				"Last 3 Months",
				"This Year"
			],
			"default": "Today",
			"reqd": 1,
		},
		{
			"label": "Lead",
			"fieldname": "lead",
			"fieldtype": "Link",
			"options": "Lead",
			get_query: function () {
				let category = frappe.query_report.get_filter_value("category");
				let state = frappe.query_report.get_filter_value("state");
				let district = frappe.query_report.get_filter_value("district");
				let owner = frappe.query_report.get_filter_value("owner");
		
				const filters = {};
				if (category) {
					if (category == "Manufacturer") {
						filters.custom_lead_category = "Manufacturer Lead"

						if (state) {
							filters.custom_states = state;
						}

						if (district) {
							filters.custom_districts = district;
						}
					} else {
						filters.custom_lead_category = "SS / Distributor Lead"

						if (state) {
							filters.custom_dist_state = state;
						}
						if (district) {
							filters.custom_dist_district0 = district;
						}
					}
				}

				if (owner) {
					filters.lead_owner = owner;
				}

				return { filters };
			}
		},
		{
			"label": "State",
			"fieldname": "state",
			"fieldtype": "Link",
			"options": "States",
			onchange: function () {
				frappe.query_report.set_filter_value("lead", "");
				frappe.query_report.refresh();
			}
		},
		{
			"label": "District",
			"fieldname": "district",
			"fieldtype": "Link",
			"options": "Districts",
			onchange: function () {
				frappe.query_report.set_filter_value("lead", "");
				frappe.query_report.refresh();
			},
			get_query: function () {
				let state = frappe.query_report.get_filter_value("state");

				return {
					filters: {
						state: state
					}
				}
			}
			
		},
		{
			"label": "Owner",
			"fieldname": "owner",
			"fieldtype": "Link",
			"options": "User",
			onchange: function () {
				frappe.query_report.set_filter_value("lead", "");
				frappe.query_report.refresh();
			}
		},
		{
			"label": "Show Bizz Interaction",
			"fieldname": "show_bizz_interaction",
			"fieldtype": "Check",
			"default": 0
		}
	]
};
