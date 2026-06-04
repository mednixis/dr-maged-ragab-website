const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const bookingButtons = document.querySelectorAll("[data-booking]");
const localBooking = document.querySelector("#local-booking");
const internationalBooking = document.querySelector("#international-booking");
const slotCards = document.querySelectorAll(".slot-card");
const forms = document.querySelectorAll(".booking-form");
const languageToggle = document.querySelector("[data-lang-toggle]");
const choiceCards = document.querySelectorAll("[data-choice-group]");
const dayCards = document.querySelectorAll(".day-card");
const calendarDays = document.querySelectorAll(".calendar-day.available");
const dateTriggers = document.querySelectorAll("[data-date-trigger]");
const monthSelects = document.querySelectorAll("[data-month-select]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminViews = document.querySelectorAll("[data-admin-view]");
const adminRoles = document.querySelectorAll("[data-admin-role]");
const adminSearch = document.querySelector("[data-admin-search]");
const adminLoginForm = document.querySelector("[data-admin-login]");

const getSavedLanguage = () => {
  try {
    return window.localStorage?.getItem("site-language");
  } catch {
    return null;
  }
};

const saveLanguage = (language) => {
  try {
    window.localStorage?.setItem("site-language", language);
  } catch {
    // Language switching still works without persistent storage.
  }
};

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

bookingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.booking;

    bookingButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    localBooking?.classList.toggle("active", type === "local");
    internationalBooking?.classList.toggle("active", type === "international");
  });
});

slotCards.forEach((slot) => {
  slot.addEventListener("click", () => {
    const group = slot.closest(".booking-content");
    group?.querySelectorAll(".slot-card").forEach((item) => item.classList.remove("selected"));
    slot.classList.add("selected");
  });
});

choiceCards.forEach((choice) => {
  choice.addEventListener("click", () => {
    const groupName = choice.dataset.choiceGroup;
    const targetId = choice.dataset.choiceTarget;
    const scope = choice.closest(".booking-content") || document;

    scope.querySelectorAll(`[data-choice-group="${groupName}"]`).forEach((item) => {
      item.classList.toggle("selected", item === choice);
    });

    scope.querySelectorAll(".choice-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  });
});

dayCards.forEach((day) => {
  day.addEventListener("click", () => {
    const group = day.closest(".choice-panel");
    group?.querySelectorAll(".day-card").forEach((item) => item.classList.remove("selected"));
    day.classList.add("selected");
  });
});

calendarDays.forEach((day) => {
  day.addEventListener("click", () => {
    const group = day.closest(".choice-panel");
    const picker = day.closest("[data-date-picker]");
    group?.querySelectorAll(".calendar-day").forEach((item) => item.classList.remove("selected"));
    day.classList.add("selected");
    const value = picker?.querySelector(".date-value");
    if (value) value.textContent = day.dataset.display || day.dataset.date || value.textContent;
    picker?.classList.remove("open");
  });
});

dateTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const picker = trigger.closest("[data-date-picker]");
    const wasOpen = picker?.classList.contains("open");
    document.querySelectorAll("[data-date-picker].open").forEach((item) => item.classList.remove("open"));
    picker?.classList.toggle("open", !wasOpen);
  });
});

monthSelects.forEach((select) => {
  select.addEventListener("change", () => {
    const picker = select.closest("[data-date-picker]");
    picker?.querySelectorAll(".calendar-month-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.calendar === select.value);
    });
  });
});

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const original = button.textContent;
    button.textContent = "Sending...";
    button.disabled = true;

    const isInternational = form.closest("#international-booking") !== null;
    const selectedDate = form.closest(".booking-content")?.querySelector(".date-value")?.textContent || "";
    const selectedSlot = form.closest(".booking-content")?.querySelector(".slot-card.selected")?.textContent?.trim().split("\n")[0] || "";
    const selectedClinic = form.closest(".booking-content")?.querySelector(".choice-card.selected strong")?.textContent?.trim() || "";

    const data = {
      patient_name: form.querySelector("input[autocomplete='name']")?.value || "",
      phone: form.querySelector("input[type='tel']")?.value || "",
      age: form.querySelector("input[type='number']")?.value || "",
      gender: form.querySelector("select")?.value || "",
      concern: form.querySelector("textarea")?.value || "",
      booking_date: selectedDate,
      booking_slot: selectedSlot,
      clinic: selectedClinic,
      patient_type: isInternational ? "international" : "local",
      status: "pending",
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch("https://oxmqwuewdrqnltwbfllq.supabase.co/rest/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bXF3dWV3ZHJxbmx0d2JmbGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQwNjIsImV4cCI6MjA5NjAyMDA2Mn0.9f5R67Wc9JssvgFotxiutXoybaMSeoOd_kA365mR8qY",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bXF3dWV3ZHJxbmx0d2JmbGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQwNjIsImV4cCI6MjA5NjAyMDA2Mn0.9f5R67Wc9JssvgFotxiutXoybaMSeoOd_kA365mR8qY",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        button.textContent = "Request Sent ✓";
        setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
          form.reset();
        }, 2000);
      } else {
        const err = await res.json();
        console.error("Booking error:", err);
        button.textContent = "Error — try again";
        button.disabled = false;
      }
    } catch (e) {
      console.error("Network error:", e);
      button.textContent = "Error — try again";
      button.disabled = false;
    }
  });
});

adminTabs.forEach((tabButton) => {
  tabButton.addEventListener("click", () => {
    const target = tabButton.dataset.adminTab;
    adminTabs.forEach((item) => item.classList.toggle("active", item === tabButton));
    adminViews.forEach((view) => view.classList.toggle("active", view.dataset.adminView === target));
  });
});

adminRoles.forEach((roleButton) => {
  roleButton.addEventListener("click", () => {
    adminRoles.forEach((item) => item.classList.toggle("active", item === roleButton));
    document.querySelector("[data-admin-app]")?.setAttribute("data-active-role", roleButton.dataset.adminRole || "admin");
  });
});

adminSearch?.addEventListener("input", () => {
  const query = adminSearch.value.trim().toLowerCase();
  document.querySelectorAll("[data-admin-record]").forEach((record) => {
    record.hidden = query.length > 0 && !record.textContent.toLowerCase().includes(query);
  });
});

document.querySelectorAll("[data-admin-action='confirm']").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("[data-admin-record]");
    const status = row?.querySelector(".status-pill");
    const slot = row?.querySelector(".slot-state");
    if (status) status.textContent = document.body.classList.contains("lang-ar") ? "تم التأكيد" : "Confirmed";
    if (slot) {
      slot.classList.add("closed");
      slot.textContent = document.body.classList.contains("lang-ar") ? "مغلق / محجوز" : "Closed / booked";
    }
  });
});

adminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = adminLoginForm.querySelector("[data-login-email]")?.value.trim();
  const password = adminLoginForm.querySelector("[data-login-password]")?.value.trim();
  const role = adminLoginForm.querySelector("[data-login-role]")?.value || "owner";
  const status = adminLoginForm.querySelector("[data-login-status]");

  if (!email || !password || password.length < 6) {
    if (status) status.textContent = document.body.classList.contains("lang-ar")
      ? "اكتب بريدًا صحيحًا وكلمة مرور لا تقل عن 6 أحرف."
      : "Enter a valid email and a password of at least 6 characters.";
    return;
  }

  try {
    window.sessionStorage.setItem("admin-demo-session", JSON.stringify({ email, role, signedInAt: new Date().toISOString() }));
  } catch {
    // The real build will use server-side sessions.
  }

  if (status) status.textContent = document.body.classList.contains("lang-ar")
    ? "تم تسجيل الدخول التجريبي. سيتم فتح لوحة الإدارة."
    : "Prototype sign-in accepted. Opening the admin dashboard.";

  window.setTimeout(() => {
    window.location.href = "admin.html";
  }, 700);
});

const setLanguage = (language) => {
  const isArabic = language === "ar";
  document.body.classList.toggle("lang-ar", isArabic);
  document.documentElement.lang = isArabic ? "ar" : "en";
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  if (languageToggle) {
    languageToggle.textContent = isArabic ? "English" : "العربية";
    languageToggle.setAttribute("aria-label", isArabic ? "Switch to English" : "Switch to Arabic");
  }
  saveLanguage(language);
};

languageToggle?.addEventListener("click", () => {
  setLanguage(document.body.classList.contains("lang-ar") ? "en" : "ar");
});

setLanguage(getSavedLanguage() || "en");
