import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../Helper/Axios_Response_Interceptor";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import Swal from "sweetalert2";

export default function ManageSubCategoryGrouped() {
  const { setGlobalLoader } = loadingStore();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({}); // { categoryID: [subCategoryList] }
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editID, setEditID] = useState(null);

  // Prevent toast on cancel
  const [cancelClicked, setCancelClicked] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setGlobalLoader(true);
      const res = await api.get("/GetCategory");
      if (res.data.status === "Success") {
        const options = res.data.data.map((cat) => ({
          value: cat._id,
          label: cat.name,
        }));
        setCategories(options);
      }
    } catch (err) {
      ErrorToast("Failed to load categories");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch subcategories for all categories
  const fetchAllSubCategories = async () => {
    const allSubs = {};
    for (const cat of categories) {
      try {
        const res = await api.get(`/GetSubCategoryByCategoryID/${cat.value}`);
        if (res.data.status === "Success") {
          allSubs[cat.value] = res.data.data || [];
        } else {
          allSubs[cat.value] = [];
        }
      } catch {
        allSubs[cat.value] = [];
      }
    }
    setSubCategories(allSubs);
  };

  // Add or Update SubCategory
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Skip validation if cancel was clicked
    if (cancelClicked) {
      setCancelClicked(false);
      return;
    }

    if (!selectedCategory) return ErrorToast("Please select a category");
    if (!subCategoryName.trim()) return ErrorToast("Enter sub category name");

    setGlobalLoader(true);
    try {
      if (editMode) {
        const res = await api.put(`/UpdateSubCategory/${editID}`, {
          categoryID: selectedCategory.value,
          name: subCategoryName,
        });
        if (res.data.status === "Success") {
          SuccessToast("SubCategory updated successfully");
          resetForm();
          await fetchAllSubCategories();
        } else ErrorToast(res.data.message);
      } else {
        const res = await api.post("/CreateSubCategory", {
          categoryID: selectedCategory.value,
          name: subCategoryName,
        });
        if (res.data.status === "Success") {
          SuccessToast("SubCategory added successfully");
          resetForm();
          await fetchAllSubCategories();
        } else ErrorToast(res.data.message);
      }
    } catch {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditMode(false);
    setEditID(null);
    setSubCategoryName("");
    // Keep selected category so Cancel doesn't trigger toast
  };

  // Cancel button
  const handleCancel = () => {
    setCancelClicked(true);
    resetForm();
  };

  // Edit SubCategory
  const handleEdit = (item, categoryID) => {
    setEditMode(true);
    setEditID(item._id);
    setSubCategoryName(item.name);
    const cat = categories.find((c) => c.value === categoryID);
    if (cat) setSelectedCategory(cat);
  };

  // Delete SubCategory
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this sub category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#a0aec0",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const res = await api.delete(`/DeleteSubCategory/${id}`);
          if (res.data.status === "Success") {
            SuccessToast("Deleted successfully");
            await fetchAllSubCategories();
          } else ErrorToast(res.data.message);
        } catch {
          ErrorToast("Failed to delete");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllSubCategories();
    }
  }, [categories]);

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Manage SubCategories
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Select Category
              </label>
              <Select
                isClearable
                options={categories}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="Select Category..."
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                SubCategory Name
              </label>
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                className="global_input"
                placeholder="Enter SubCategory Name"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="global_button_red mr-3 cursor-pointer"
                >
                  Cancel
                </button>

                <button type="submit" className="global_edit cursor-pointer">
                  Update
                </button>
              </>
            ) : (
              <button type="submit" className="global_button cursor-pointer">
                Add
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SubCategories Table (Grouped by Category) */}
      {categories.map((cat) => (
        <div key={cat.value} className="global_sub_container">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
            {cat.label}
          </h2>

          {subCategories[cat.value] && subCategories[cat.value].length > 0 ? (
            <div className="w-full overflow-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr className="global_tr">
                    <th className="global_th">No</th>
                    <th className="global_th">SubCategory Name</th>
                    <th className="global_th">Action</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {subCategories[cat.value].map((sub, index) => (
                    <tr key={sub._id} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{sub.name}</td>

                      <td className="global_td space-x-2">
                        <button
                          onClick={() => handleEdit(sub, cat.value)}
                          className="global_edit cursor-pointer inline-block align-middle"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="global_button_red inline-block align-middle cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              No subcategories found.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
