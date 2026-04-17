// src/features/cms/pages/UserManualPage.tsx
import {
  LayoutDashboard,
  Utensils,
  FileText,
  Image,
  Mail,
  Settings,
  Users,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Flame,
  Plus,
  Pencil,
  Trash2,
  Upload,
  KeyRound,
  BarChart2,
  FileDown,
} from "lucide-react";

// ── Primitives ────────────────────────────────────────────────────────────────

function SectionCard({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-2.5">{children}</ol>;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
    </li>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
      <Lightbulb size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 leading-relaxed">{children}</p>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-gray-400">{title}</h3>
      {children}
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ElementType;
  label: string;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}

// ── Quick Nav ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "menu", label: "Menu", icon: Utensils },
  { id: "content", label: "Content", icon: FileText },
  { id: "media", label: "Media", icon: Image },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

function QuickNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors"
        >
          <Icon size={12} />
          {label}
        </a>
      ))}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserManualPage() {
  return (
    <div className="pb-16 space-y-6">

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-red to-red-700 px-7 py-8 text-white shadow-md">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-red-200 mb-2">Documentation</p>
        <h1 className="text-3xl font-bold mb-2">Need Help?</h1>
        <p className="text-red-100 text-sm leading-relaxed max-w-lg">
          A guide to managing your restaurant website. Find the section you need below.
        </p>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 space-y-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Jump to section</p>
        <QuickNav />
      </div>

      {/* ── Dashboard ─────────────────────────────────────────────────── */}
      <SectionCard
        id="dashboard"
        icon={LayoutDashboard}
        iconColor="text-violet-600"
        iconBg="bg-violet-50"
        title="Dashboard"
        subtitle="A quick overview of your site"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Dashboard is the first page you land on after logging in. It shows a live summary of your
          site's content and what's been changed recently.
        </p>

        <SubSection title="What you will find here">
          <ul className="space-y-2">
            {[
              { icon: BarChart2, label: "Traffic", desc: "Total page views, unique visitors, and a daily breakdown." },
              { icon: Utensils, label: "Menu stats", desc: "How many categories, items, and images are on the site." },
              { icon: FileText, label: "Recent activity", desc: "A log of the last few edits made in the CMS." },
            ].map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700"><span className="font-medium">{label}:</span> {desc}</span>
              </li>
            ))}
          </ul>
        </SubSection>

        <Tip>
          If something on the public site looks outdated, check the activity log on the Dashboard
          to see when it was last changed.
        </Tip>
      </SectionCard>

      {/* ── Users ─────────────────────────────────────────────────────── */}
      <SectionCard
        id="users"
        icon={Users}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        title="Users"
        subtitle="Control who has access to the CMS (Admin only)"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Users page is where you create and remove CMS accounts. It is only visible to
          users with the <span className="font-medium text-gray-800">Admin</span> role.
        </p>

        <SubSection title="Roles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1">
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-brand-red text-white">Admin</span>
              <p className="text-sm text-gray-600">Full access to everything, including user management and site settings.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1">
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">Editor</span>
              <p className="text-sm text-gray-600">Can edit content and the menu, but cannot manage users.</p>
            </div>
          </div>
        </SubSection>

        <Divider />

        <SubSection title="Adding a new user">
          <Steps>
            <Step n={1}>Click the <span className="font-semibold">+ Add User</span> button in the top right.</Step>
            <Step n={2}>Enter their email address and a temporary password (minimum 6 characters).</Step>
            <Step n={3}>Select their role: <span className="font-semibold">Admin</span> or <span className="font-semibold">Editor</span>.</Step>
            <Step n={4}>Click <span className="font-semibold">Create User</span> and share the login details with them.</Step>
          </Steps>
        </SubSection>

        <SubSection title="Changing a password">
          <Steps>
            <Step n={1}>Find the user in the table and click the <span className="inline-flex items-center gap-1 font-medium"><KeyRound size={12} /> Password</span> button.</Step>
            <Step n={2}>Enter and confirm the new password, then save.</Step>
          </Steps>
        </SubSection>

        <Warning>
          Deleting a user is permanent. They will lose access immediately and this cannot be undone.
          You cannot delete your own account.
        </Warning>
      </SectionCard>

      {/* ── Menu ──────────────────────────────────────────────────────── */}
      <SectionCard
        id="menu"
        icon={Utensils}
        iconColor="text-brand-red"
        iconBg="bg-red-50"
        title="Menu"
        subtitle="Categories, items, ordering, and customization options"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Menu page is where you manage everything customers see on the menu. You can add and
          organize dishes into categories, control what is visible, highlight featured items, and set
          up customization panels for things like protein choices or add-ons.
        </p>

        <SubSection title="Categories">
          <Steps>
            <Step n={1}>Click <span className="font-semibold">+ Add Category</span> to create a new section (for example, "Appetizers").</Step>
            <Step n={2}>Click the <span className="inline-flex items-center gap-1 font-medium"><Pencil size={12} /> edit</span> icon next to a category name to rename it.</Step>
            <Step n={3}>
              Drag the <span className="inline-flex items-center gap-1 font-medium"><GripVertical size={12} />grip handle</span> on the left to reorder categories.
              The order here matches what customers see on the public menu.
            </Step>
            <Step n={4}>Click <span className="inline-flex items-center gap-1 font-medium text-red-500"><Trash2 size={12} /> delete</span> to remove a category. <span className="font-semibold">This will also delete every item inside it.</span></Step>
          </Steps>
        </SubSection>

        <Divider />

        <SubSection title="Menu items">
          <Steps>
            <Step n={1}>Open a category and click <span className="font-semibold">+ Add Item</span>.</Step>
            <Step n={2}>Fill in the name, description, price, and upload an image if you have one.</Step>
            <Step n={3}>Drag items by the grip handle to reorder them within a category.</Step>
          </Steps>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
              <Badge icon={Eye} label="Visible" className="bg-green-100 text-green-700" />
              <p className="text-xs text-gray-600">The item shows on the public menu. Turn this off to hide it without deleting it, useful for seasonal dishes or anything temporarily unavailable.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
              <Badge icon={Star} label="Featured" className="bg-amber-100 text-amber-700" />
              <p className="text-xs text-gray-600">The item appears in the Featured section on the homepage. Only a few items should be featured at a time.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
              <Badge icon={Flame} label="Popular" className="bg-orange-100 text-orange-700" />
              <p className="text-xs text-gray-600">Marks the item as a crowd favourite. A badge will appear next to it on the menu page.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
              <Badge icon={EyeOff} label="Hidden" className="bg-gray-100 text-gray-500" />
              <p className="text-xs text-gray-600">Only you can see this item in the CMS. It will not appear on the public menu or in the PDF download.</p>
            </div>
          </div>
        </SubSection>

        <Divider />

        <SubSection title="Bilingual item names">
          <p className="text-sm text-gray-600 leading-relaxed">
            You can show both a Vietnamese and English name for any item. Use this format when typing the item name:
          </p>
          <div className="bg-gray-900 rounded-xl px-4 py-3 font-mono text-sm text-green-400">
            [Phở Bò] Beef Pho
          </div>
          <p className="text-sm text-gray-500">
            The text inside <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">[ ]</code> is the Vietnamese name.
            The text after it is the English name. Both are shown on the public menu.
          </p>
        </SubSection>

        <Divider />

        <SubSection title="Customization options">
          <p className="text-sm text-gray-600 leading-relaxed">
            Each category can have a collapsible panel on the menu page that shows options like protein
            choices, broth types, toppings, or add-ons with prices.
          </p>
          <Steps>
            <Step n={1}>Open a category and click <span className="font-semibold">Manage Customizations</span>.</Step>
            <Step n={2}>Add one or more sections (for example, "Proteins" or "Add-ons").</Step>
            <Step n={3}>Inside each section, add items with an optional price (for example, "Rare Beef +$1.00").</Step>
            <Step n={4}>Use the toggle to enable or disable the panel for that category.</Step>
          </Steps>
          <Tip>
            Customers see this as a "Customize Your [Category]" panel that expands below the
            category header on the menu page.
          </Tip>
        </SubSection>

        <Divider />

        <SubSection title="PDF menu">
          <p className="text-sm text-gray-600 leading-relaxed">
            A downloadable PDF of the menu is available on the public site. It is generated from
            the current visible items. You can change the download button label and how often it
            refreshes in <a href="#settings" className="text-brand-red hover:underline font-medium">Settings</a>.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileDown size={15} className="text-gray-400" />
            Only <span className="font-medium">visible</span> items are included in the PDF.
          </div>
        </SubSection>

        <Tip>
          Use the search bar at the top of the CMS to find any item by name or description
          across all categories.
        </Tip>
      </SectionCard>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <SectionCard
        id="content"
        icon={FileText}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        title="Content"
        subtitle="Edit the text and images shown across your site"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Content page has five tabs, one for each major section of the website. Click a tab to
          switch between them.
        </p>

        {[
          {
            label: "Hero Section",
            desc: "The large banner at the top of the homepage. You can edit the headline, subtitle, and the two buttons. You can also change the background image.",
          },
          {
            label: "About Section",
            desc: "The full About page, including the restaurant story, origin, food philosophy, and closing message. Each part has its own text fields and image.",
          },
          {
            label: "Contact Section",
            desc: "Your address, phone number, email, and online ordering link. This tab also includes operating hours for each day of the week, with a toggle to mark a day as closed.",
          },
          {
            label: "Navbar",
            desc: "The navigation links shown at the top of every public page. You can rename links and update where they point. Admin only.",
          },
          {
            label: "Footer",
            desc: "The footer navigation links, social media links, and contact info shown at the bottom of the site.",
          },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <ChevronRight size={15} className="text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}

        <Tip>
          Every tab has its own <span className="font-semibold">Save</span> button. Nothing is
          published until you save. If you leave the page without saving, your changes will be lost.
        </Tip>
      </SectionCard>

      {/* ── Media ─────────────────────────────────────────────────────── */}
      <SectionCard
        id="media"
        icon={Image}
        iconColor="text-pink-600"
        iconBg="bg-pink-50"
        title="Media"
        subtitle="Upload and manage images"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          All images on the site are stored in the cloud. The Media page is where you upload new
          images and remove ones you no longer need.
        </p>

        <SubSection title="Uploading an image">
          <Steps>
            <Step n={1}>Choose the <span className="font-semibold">Section</span> the image belongs to: Menu, Hero, About, or Brand.</Step>
            <Step n={2}>Click <span className="font-semibold">Choose File</span> and select a JPEG, PNG, or WebP image.</Step>
            <Step n={3}>The image uploads automatically and appears in the grid below.</Step>
            <Step n={4}>To use the image on a menu item or content section, copy its URL from the image picker in that editor.</Step>
          </Steps>
        </SubSection>

        <SubSection title="Sections">
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Menu", desc: "Dish photos for menu items" },
              { name: "Hero", desc: "Homepage banner background" },
              { name: "About", desc: "Images used on the About page" },
              { name: "Brand", desc: "Logo and brand assets" },
            ].map(({ name, desc }) => (
              <div key={name} className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-bold text-gray-700">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </SubSection>

        <Warning>
          Deleting an image removes it permanently. If a menu item or content section is still
          using that image, it will show as broken on the public site. Update those references
          before deleting.
        </Warning>

        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
          <Upload size={14} className="text-gray-400" />
          Max file size: <span className="font-medium text-gray-700">5 MB</span>. Accepted formats:
          <span className="font-medium text-gray-700">JPEG, PNG, WebP</span>
        </div>
      </SectionCard>

      {/* ── Messages ──────────────────────────────────────────────────── */}
      <SectionCard
        id="messages"
        icon={Mail}
        iconColor="text-sky-600"
        iconBg="bg-sky-50"
        title="Messages"
        subtitle="View and reply to contact form submissions and emails"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Messages page shows contact form submissions from your website alongside emails in
          your connected Gmail account, all in one place.
        </p>

        <SubSection title="Connecting Gmail (first time only)">
          <Steps>
            <Step n={1}>Open the Messages page. If Gmail is not connected, you will see a <span className="font-semibold">Gmail Not Connected</span> message on the right side.</Step>
            <Step n={2}>Click <span className="font-semibold">Authenticate with Google</span>. A popup will open for you to sign in.</Step>
            <Step n={3}>Grant the permissions and the popup will close on its own.</Step>
            <Step n={4}>Your inbox will load. You only need to do this once.</Step>
          </Steps>
          <Tip>
            Once Gmail is connected, you can see full email threads including replies from customers,
            not just the original form submission.
          </Tip>
        </SubSection>

        <Divider />

        <SubSection title="Reading and replying">
          <Steps>
            <Step n={1}>Click any thread on the left to open it.</Step>
            <Step n={2}>Click the <span className="font-semibold">Reply</span> button at the bottom to write a response.</Step>
            <Step n={3}>Type your message and click <span className="font-semibold">Send</span>. The reply goes out from your Gmail account.</Step>
          </Steps>
        </SubSection>

        <SubSection title="Managing your inbox">
          <ul className="space-y-2">
            {[
              { action: "Mark read / unread", desc: "Click the small dot to the left of the sender's name to toggle the read status." },
              { action: "Customers only", desc: "Turn on this filter to hide internal Gmail threads and only show messages from customers." },
              { action: "Load more", desc: "Scroll to the bottom of the list and click Load More to see older threads." },
              { action: "Delete", desc: "Click the trash icon on a thread to move it to Gmail's trash." },
            ].map(({ action, desc }) => (
              <li key={action} className="flex items-start gap-3">
                <ChevronRight size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700"><span className="font-medium">{action}:</span> {desc}</span>
              </li>
            ))}
          </ul>
        </SubSection>

        <Tip>
          If Gmail is not connected, contact form submissions are still saved and visible here.
          You just will not be able to see the full thread or reply inline.
        </Tip>
      </SectionCard>

      {/* ── Settings ──────────────────────────────────────────────────── */}
      <SectionCard
        id="settings"
        icon={Settings}
        iconColor="text-gray-600"
        iconBg="bg-gray-100"
        title="Settings"
        subtitle="Site info, SEO, notifications, and PDF options"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          The Settings page controls site-wide options. Changes here affect how the site appears
          in search results, how contact form messages are handled, and how the PDF menu works.
        </p>

        {[
          {
            title: "Site Identity",
            items: [
              { label: "Site Name", desc: "The restaurant name used in the browser tab and across the site." },
              { label: "Tagline", desc: "A short line shown in a few places across the site." },
            ],
          },
          {
            title: "SEO",
            items: [
              { label: "Meta Description", desc: "The text Google shows under your site name in search results. Aim for 150 to 160 characters." },
              { label: "Google Analytics ID", desc: "Paste your G-XXXXXXXX tracking ID here to turn on analytics. Leave it blank to disable tracking." },
            ],
          },
          {
            title: "Contact Notifications",
            items: [
              { label: "Email Notifications", desc: "When turned on, you will get an email each time someone submits the contact form." },
              { label: "Notification Email", desc: "The address that receives contact form alerts. If left blank, it falls back to the Gmail address on the server." },
              { label: "Store Messages in Inbox", desc: "When turned on, form submissions are saved to the database and visible on the Messages page." },
            ],
          },
          {
            title: "PDF Menu",
            items: [
              { label: "Download Button Label", desc: "The text on the PDF download button on the public menu page, for example \"Download Menu\" or \"View Full Menu\"." },
              { label: "Cache Duration", desc: "How many minutes the generated PDF is kept before it regenerates. Set it lower if you want the PDF to reflect menu edits faster." },
            ],
          },
        ].map(({ title, items }) => (
          <SubSection key={title} title={title}>
            <ul className="space-y-2.5">
              {items.map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700"><span className="font-medium text-gray-900">{label}:</span> {desc}</span>
                </li>
              ))}
            </ul>
          </SubSection>
        ))}

        <Tip>
          After editing the menu, lower the cache duration temporarily so the PDF updates right away.
          You can raise it back once you are done making changes.
        </Tip>
      </SectionCard>

    </div>
  );
}
