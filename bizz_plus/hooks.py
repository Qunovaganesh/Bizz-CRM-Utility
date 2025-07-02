app_name = "bizz_plus"
app_title = "Bizz Plus"
app_publisher = "sandip.pandit"
app_description = "SFA_DMS"
app_email = "ganesh.t@qunovatec.com"
app_license = "mit"

# Apps
# ------------------
app_include_js = ["/assets/bizz_plus/sw.js"]
app_include_html = "/assets/bizz_plus/pwa_meta.html"

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "bizz_plus",
# 		"logo": "/assets/bizz_plus/logo.png",
# 		"title": "Bizz Plus",
# 		"route": "/bizz_plus",
# 		"has_permission": "bizz_plus.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------
fixtures = [{"doctype": "Custom Field"}]

# include js, css files in header of desk.html
# app_include_css = "/assets/bizz_plus/css/bizz_plus.css"
# app_include_js = "/assets/bizz_plus/js/bizz_plus.js"

# include js, css files in header of web template
# web_include_css = "/assets/bizz_plus/css/bizz_plus.css"
# web_include_js = "/assets/bizz_plus/js/bizz_plus.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "bizz_plus/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views

# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "bizz_plus/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "bizz_plus.utils.jinja_methods",
# 	"filters": "bizz_plus.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "bizz_plus.install.before_install"
# after_install = "bizz_plus.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "bizz_plus.uninstall.before_uninstall"
# after_uninstall = "bizz_plus.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "bizz_plus.utils.before_app_install"
# after_app_install = "bizz_plus.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "bizz_plus.utils.before_app_uninstall"
# after_app_uninstall = "bizz_plus.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "bizz_plus.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events



# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"bizz_plus.tasks.all"
# 	],
# 	"daily": [
# 		"bizz_plus.tasks.daily"
# 	],
# 	"hourly": [
# 		"bizz_plus.tasks.hourly"
# 	],
# 	"weekly": [
# 		"bizz_plus.tasks.weekly"
# 	],
# 	"monthly": [
# 		"bizz_plus.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "bizz_plus.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "bizz_plus.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "bizz_plus.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["bizz_plus.utils.before_request"]
# after_request = ["bizz_plus.utils.after_request"]

# Job Events
# ----------
# before_job = ["bizz_plus.utils.before_job"]
# after_job = ["bizz_plus.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"bizz_plus.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

override_doctype_class = {
   "Lead": "bizz_plus.overrides.lead.CustomLead"
}
doctype_js = {"Lead" : "public/js/lead.js"}
doctype_list_js = {"Lead" : "public/js/lead_list.js"}

doc_events = {
	"Lead": {
		"on_update": "bizz_plus.api.pincode_api.after_insert_or_update_lead",
		
	}
   "BizzPlus Expenses utility":{
	   "*":"bizz_plus.api.pincode_api.notify"
   }
}