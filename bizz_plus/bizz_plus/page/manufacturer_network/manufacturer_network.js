frappe.pages["manufacturer-network"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Manufacturer Network	"),
		single_column: true,
	});
};

frappe.pages["manufacturer-network"].on_page_show = function (wrapper) {
	load_desk_page(wrapper);
};

function load_desk_page(wrapper) {
	let $parent = $(wrapper).find(".layout-main-section");
	$parent.empty();

	frappe.require("manufacturer_network.bundle.js").then(() => {
		frappe.manufacturer_network = new frappe.ui.ManufacturerNetwork({
			wrapper: $parent,
			page: wrapper.page,
		});
	});
}