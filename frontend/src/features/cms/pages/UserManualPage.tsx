import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/components/ui/accordion";

export default function UserManualPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Need Help?</h1>
      <p className="text-gray-700 mb-6">
        This page will guide you through how to edit your website
      </p>

      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="overview">
          <AccordionTrigger>Getting Started</AccordionTrigger>
          <AccordionContent>
            This dashboard lets you manage your restaurant’s online content
            easily. Use the menu on the left to open different sections
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="menu">
          <AccordionTrigger>Editing the Menu</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Go to the <strong>Menu</strong> tab in the sidebar.
              </li>
              <li>
                Click <strong>+ Add Item</strong> to add a new dish.
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="about">
          <AccordionTrigger>Updating the About Section</AccordionTrigger>
          <AccordionContent>
            <p>
              Go to the <strong>About</strong> page to update your restaurant’s
              story .
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
