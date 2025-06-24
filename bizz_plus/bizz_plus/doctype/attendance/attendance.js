frappe.ui.form.on('Attendance', {
    onload: function (frm) {
        if(frm.is_new()) {
        if (navigator.geolocation) {
          console.log("Geolocation supported. Requesting location...");
      
          navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
      
            frm.set_value('latitude', lat);
            frm.set_value('longitude', lon);
            frm.refresh_fields(['latitude', 'longitude']);
      
            // Check if `location` is a Geolocation field before setting
            // if (frm.fields_dict.location.df.fieldtype === "Geolocation") {
            //   frm.set_value('location', {
            //     latitude: lat,
            //     longitude: lon
            //   });
            //   frm.refresh_field('location');
            // }
      
            // frappe.msgprint(`Location captured: ${lat}, ${lon}`);
            // console.log(`Latitude: ${lat}, Longitude: ${lon}`);
          }, function (error) {
            console.error("Geolocation error", error);
            frappe.msgprint(`Error: ${error.message}`);
          });
        } else {
          frappe.msgprint("Geolocation is not supported by this browser.");
          console.warn("Geolocation not supported");
        }
    }
      }
      ,
    refresh: function (frm) {
      // Inject custom HTML into the 'selfie_upload' field
      frm.fields_dict.selfie_upload.$wrapper.html(`
        <div style="max-width: 300px; margin: 10px 0;">
          <label for="selfie_input" style="font-weight: bold;">Upload Selfie:</label><br>
          <input type="file" accept="image/*" capture="user" id="selfie_input" 
                 style="display: block; padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-top: 5px; margin-bottom: 15px;">
          <button class="btn btn-primary" id="upload_selfie">Upload Selfie</button>
        </div>
      `);
  
      // Prevent multiple bindings
      if (frm.selfie_handler_bound) return;
      frm.selfie_handler_bound = true;
  
      $(document).on('click', '#upload_selfie', async function () {
        const file = document.getElementById("selfie_input").files[0];
        if (!file) {
          frappe.msgprint("Please select an image");
          return;
        }
  
        // Upload selfie
        let formData = new FormData();
        formData.append("file", file);
        formData.append("is_private", 0);
  
        try {
          const res = await fetch("/api/method/upload_file", {
            method: "POST",
            body: formData,
            headers: {
              "X-Frappe-CSRF-Token": frappe.csrf_token
            }
          });
  
          const data = await res.json();
          if (data.message && data.message.file_url) {
            frappe.msgprint("Selfie uploaded!");
  
            // Save file URL to hidden field
            frm.set_value("selfie", data.message.file_url);
            frm.refresh_field("selfie");
          }
  
          // Now get location
          
  
        } catch (err) {
          console.error("Upload failed", err);
          frappe.msgprint("Error uploading selfie.");
        }
      });
    }
  });
  