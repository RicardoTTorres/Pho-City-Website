let contactInfo = {
  address: "6175 Stockton Blvd #200, Sacramento, CA 95824",
  phone: "(916) 754-2143",
  email: "info@phocity.com",
  onlineOrdering: "https://order.phocity.com",
  hours: {
    Monday: "9am - 8pm",
    Tuesday: "closed",
    Wednesday: "9am - 8pm",
    Thursday: "9am - 8pm",
    Friday: "9am - 8pm",
    Saturday: "10am - 8pm",
    Sunday: "9am - 8pm",
  },
};

export function getContactInfo(req, res) {
  res.json(contactInfo);
}

export function updateContactInfo(req, res) {
  const newData = req.body;
  contactInfo = { ...contactInfo, ...newData };
  res.json({ message: "Contact info updated successfully", contactInfo });
}
