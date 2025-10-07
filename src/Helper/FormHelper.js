import Swal from "sweetalert2";

const EmailRegx = /\S+@\S+\.\S+/;
const OnlyNumberRegx = /^-?[0-9]+(?:\.[0-9]+)?$/;
const MobileRegx = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;

class FormHelper {
  IsEmpty(value) {
    return value === undefined || value === null || value.length === 0;
  }

  IsMobile(value) {
    return MobileRegx.test(value);
  }

  IsEmail(value) {
    return EmailRegx.test(value);
  }

  IsNumber(value) {
    return OnlyNumberRegx.test(value);
  }

  ErrorToast(msg) {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Error</span>',
      html: `<p class="text-gray-600 dark:text-gray-300">${msg}</p>`,
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.25)", // Soft frosted glass
      backdrop: `
        rgba(0, 0, 0, 0.35)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
        fixed
      `,
      customClass: {
        popup:
          "rounded-xl border border-white/20 dark:border-gray-700/40 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/30 via-pink-100/30 to-blue-100/30 dark:from-gray-800/30 dark:via-purple-800/30 dark:to-blue-900/30",
        confirmButton:
          "px-5 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-lg font-semibold transition-colors backdrop-blur-sm",
        title: "text-lg font-bold",
        htmlContainer: "mt-2 text-sm",
      },
      buttonsStyling: false,
      confirmButtonText: "Ok",
      cancelButtonText: "",
      reverseButtons: true,
    });
  }

  // SuccessToast(msg) {
  //   Swal.fire({
  //     icon: "success",
  //     title: "Success",
  //     text: msg,
  //     position: "bottom-center",
  //   });
  // }

  SuccessToast(msg) {
    Swal.fire({
      title: '<span class="text-green-400">Success</span>',
      html: `<p class="text-gray-600 dark:text-gray-300">${msg}</p>`,
      icon: "info",
      background: "rgba(255, 255, 255, 0.25)", // Soft frosted glass
      backdrop: `
        rgba(0, 0, 0, 0.35)
       
        left top
        no-repeat
        fixed
      `,
      customClass: {
        popup:
          "rounded-xl border border-white/20 dark:border-gray-700/40 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/30 via-pink-100/30 to-blue-100/30 dark:from-gray-800/30 dark:via-purple-800/30 dark:to-blue-900/30",
        confirmButton:
          "px-5 py-2 bg-green-600/90 hover:bg-green-700/90 text-white rounded-lg font-semibold transition-colors backdrop-blur-sm",
        title: "text-lg font-bold",
        htmlContainer: "mt-2 text-sm",
      },
      buttonsStyling: false,
      confirmButtonText: "Ok",
      reverseButtons: true,
    });
  }
}

const formHelper = new FormHelper();

export const {
  IsEmpty,
  IsMobile,
  IsNumber,
  IsEmail,
  ErrorToast,
  SuccessToast,
} = formHelper;
