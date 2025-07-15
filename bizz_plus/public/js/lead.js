frappe.ui.form.on("Lead", {


    after_save:function(frm){
    if (!frm.is_new()) {
   frm.set_df_property("custom_lead_category", "read_only", 1);
   frm.set_df_property("custom_lead_category", "hidden", 1);
   frm.reload_doc()
}
    },
    custom_lead_category: function (frm) {
        if(frm.doc.custom_lead_category)
           { update_lead_category_fields(frm);

            if(frm.doc.custom_lead_category==="SS / Distributor Lead")
                 frm.set_df_property("custom_super_stockiest_or_distributor","reqd",1)

           }    
           else
                 frm.set_df_property("custom_super_stockiest_or_distributor","reqd",0)

           
        
    },

    onload: function (frm) {

        if (frappe.user.has_role("System Manager") )
                return
    


        if (frappe.user.has_role("Brand Pilot") ){
                frm.set_df_property("custom_lead_category", "read_only", 1);
                frm.set_df_property("custom_lead_category", "hidden", 1);
                frm.set_value("custom_lead_category", "Manufacturer Lead");
    } 
    else if (frappe.user.has_role("Super Stockiests and Distributor Pilots")) {
                frm.set_df_property("custom_lead_category", "read_only", 1);
                frm.set_df_property("custom_lead_category", "hidden", 1);
                frm.set_value("custom_lead_category", "SS / Distributor Lead");
        }

                                 
        $('li[id="lead-dashboard_tab-tab"]').hide();

        // Hide Notes tab
        $('li[id="lead-notes_tab-tab"]').hide();

        // Hide Activities (Timeline) tab
        $('li[id="lead-activities_tab-tab"]').hide();
        if (!frm.is_new()) {
            frm.set_df_property("custom_lead_category", "read_only", 1);
            frm.set_df_property("custom_lead_category", "hidden", 1);
            frm.set_df_property("upload_agreement_tab","hidden",0)
            frm.set_df_property("lead_owner","read_only",1)
            
            // custom_invoice_amount
            // custom_commission_in_percentage
            // custom_commission_amount
    }  
    if(!frm.is_new() && frm.doc.workflow_state=="Converted"){
        frm.set_df_property("custom_invoice_amount", "read_only", 1);
        frm.set_df_property("custom_commission_in_percentage", "read_only", 1);
        frm.set_df_property("custom_commission_amount", "read_only", 1);

    }

     else
        frm.set_df_property("upload_agreement_tab","hidden",1)


        frm.trigger("custom_lead_category");
        toggle_sections_by_workflow(frm);
    },

    refresh: function (frm) {
        frm.trigger("custom_lead_category");
        toggle_sections_by_workflow(frm);
    },

    workflow_state: function (frm) {
        toggle_sections_by_workflow(frm);

        if (frm.doc.workflow_state == "Prospect") {
            frm.set_df_property("custom_invoice_amount", "reqd", 1);
            frm.set_df_property("custom_commission_in_percentage", "reqd", 1);
            frm.set_df_property("custom_commission_amount", "reqd", 1);
        } else {
            frm.set_df_property("custom_invoice_amount", "reqd", 0);
            frm.set_df_property("custom_commission_in_percentage", "reqd", 0);
            frm.set_df_property("custom_commission_amount", "reqd", 0);
        }
    },

    custom_commission_in_percentage:function(frm){
        set_commission(frm)
    },
    custom_invoice_amount:function(frm){
        set_commission(frm)
    }

});


function update_lead_category_fields(frm) {
    const is_manufacturer = frm.doc.custom_lead_category === "Manufacturer Lead";
    console.log(is_manufacturer,"----------------")

    // // Toggle read-only
    // frm.set_df_property("company_name", "reqd", is_manufacturer ? 1 : 0);
    // frm.set_df_property("custom_distributor_company_name", "reqd", is_manufacturer ? 0 : 1);

    // Toggle required
    frm.set_df_property("custom_distributor_company_name", "reqd", !is_manufacturer);
    frm.set_df_property("company_name", "reqd", is_manufacturer);

}


function toggle_sections_by_workflow(frm) {
    const state = frm.doc.workflow_state;

    // Show "Agreement" tab only for selected states
    const show_agreement_tab = ["Prospect", "Agreement Signed", "Converted", "Lead"].includes(state)|| "";
    frm.toggle_display("upload_agreement_tab", show_agreement_tab);

    // Show "Primary Invoice" tab only when agreement is signed or converted
    const show_invoice_tab = ["Agreement Signed", "Converted"].includes(state);
    frm.toggle_display("upload_primary_invoice_tab", show_invoice_tab);
}

function set_commission(frm){
    // console.log(custom_invoice_amount,custom_commission_in_percentage,custom_commission_amount,"-----")
    if(frm.doc.custom_invoice_amount<1){
        frappe.msgprint("Please enter invoice amount")
    }
    if (frm.doc.custom_invoice_amount&&frm.doc.custom_commission_in_percentage){
        let commission_amount=frm.doc.custom_invoice_amount*(frm.doc.custom_commission_in_percentage)/100
        frm.set_value("custom_commission_amount",commission_amount)
        frm.refresh_field("custom_commission_amount")
    }
}
// custom_invoice_amount
// custom_commission_in_percentage
// custom_commission_amount



