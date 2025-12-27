import React from "react";

export function MessagesPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Send us a Message</h1>
        <p className="text-center text-gray-600 mb-6">
          Have a question or need support? Complete the form below and our team will be with you shortly.
        </p>

        {/* Embed GHL Form */}
        <div className="w-full h-[600px]">
          <iframe
            src="https://api.ecrofmediaco.com/widget/form/b75H76Mxa96eArrM1dN5"
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "3px" }}
            id="inline-b75H76Mxa96eArrM1dN5"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Portal message"
            data-height="undefined"
            data-layout-iframe-id="inline-b75H76Mxa96eArrM1dN5"
            data-form-id="b75H76Mxa96eArrM1dN5"
            title="Portal message"
          />
          <script src="https://api.ecrofmediaco.com/js/form_embed.js"></script>
        </div>
      </div>
    </div>
  );
}
