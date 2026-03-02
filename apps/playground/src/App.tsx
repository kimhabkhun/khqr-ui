import { Button } from "@khqr-ui/ui";

export default function App() {
  return (
    <div className="p-10 space-x-4">
      <Button className="bg-gray-200">Default</Button>
      <Button variant="primary" className="bg-blue-600 text-white hover:bg-blue-700">
        Primary
      </Button>
    </div>
  );
}