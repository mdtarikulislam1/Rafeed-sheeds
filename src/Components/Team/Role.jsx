import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";

const Role = () => {
  const [Roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [searchKeyWord, setSearchKeyword] = useState("");
  const formRef = useRef(null);
  // Fetch Brands
  const fetchRoles = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetRole`, {
        headers: { token: getToken() },
      });
      setRoles(res.data || []);
    } catch (error) {
      ErrorToast("Failed to load Role");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      if (editId) {
        const res = await axios.post(`${BaseURL}/UpdateRole/${editId}`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Role updated successfully!");
          setForm({ name: "" });
          setEditId(null);
          fetchRoles();
        } else {
          ErrorToast(res.data.message || "Failed to update Role");
        }
      } else {
        const res = await axios.post(`${BaseURL}/CreateRole`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "success") {
          SuccessToast("Role created successfully!");
          setForm({ name: "" });
          fetchRoles();
        } else if (res.data.status === "fail") {
          ErrorToast(res.data.message);
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleEdit = (Role) => {
    setEditId(Role._id);
    setForm({ name: Role.name });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await axios.get(`${BaseURL}/DeleteRole/${id}`, {
            headers: { token: getToken() },
          });
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchRoles();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete Role");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  // ✅ Filter brands by search keyword
  const filteredRoles = Roles.filter((Role) =>
    Role.name.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Role Management
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 flex flex-col lg:flex-row justify-between  gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Role Name"
              className="global_input
            "
              required
            />

            <button
              type="submit"
              className={editId ? "global_edit w-full" : "global_button w-full"}
            >
              {editId ? "Update Role" : "Create Role"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Search Role"
            value={searchKeyWord}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="global_input h-fit w-full lg:w-lg
          "
          />
        </form>
      </div>

      {/* Brand List */}
      <div className="global_sub_container space-y-3">
        {filteredRoles.map((Role) => (
          <div
            key={Role._id}
            className="global_list_item
            "
          >
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {Role.name}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(Role)}
                className="global_edit
                "
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(Role._id)}
                className="global_button_red
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Show message if no results */}
        {filteredRoles.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Role found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Role;
