import React, { useState, useEffect } from "react";
import {
  getBusinessDetails,
} from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast, IsEmpty } from "../../Helper/FormHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const BusinessSetting = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    website: "",
    logo: "",
    subscription: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    const BusinessDetails = getBusinessDetails();
    if (BusinessDetails) {
      setBusinessId(BusinessDetails._id);
      setFormData({
        name: BusinessDetails.name || "",
        email: BusinessDetails.email || "",
        mobile: BusinessDetails.mobile || "",
        address: BusinessDetails.address || "",
        website: BusinessDetails.website || "",
        logo: BusinessDetails.logo || "",
        subscription: BusinessDetails.subscription || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!businessId) {
        ErrorToast("Business ID not found!");
        return;
      }

      const response = await api.put(
        `/UpdateBusiness/${businessId}`,
        formData,
      );

      if (response.status === 200) {
        SuccessToast("Business information updated successfully!");
      } else {
        ErrorToast("Failed to update business information.");
      }
    } catch (error) {
      console.error("Update error:", error);
      ErrorToast(
        error.response?.data?.message || "An error occurred while updating"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="global_container">
      <form
        onSubmit={handleSubmit}
        className="global_sub_container flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold mb-6">Business Settings</h2>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium  mb-1">
            Business Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="global_input"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium  mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="global_input"
          />
        </div>

        {/* Mobile Field */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium  mb-1">
            Mobile
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="global_input"
          />
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="global_input"
          />
        </div>

        {/* Website Field */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">
            Website
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="global_input"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className={`global_button`}>
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default BusinessSetting;
