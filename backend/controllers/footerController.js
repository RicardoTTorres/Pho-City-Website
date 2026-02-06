export function getFooter(req, res) {
    res.json({
        footer: {
            navLinks: [
                { label: "Home", path: "/"},
                { label: "About", path: "/about"},
                { label: "Menu", path: "/menu"},
                { label: "Contact", path: "/contact"},
                {
                    label: "Order",
                    path: "https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200",
                    external: true
                }
            ],
            contact: {
                address: "6175 Stockton Blvd #200",
                cityZip: "Sacramento, CA 95824",
                phone: "(916) 754-2143"
            },
            instagram: {
                href: "https://instagram.com/"
            }
        }
    });
}