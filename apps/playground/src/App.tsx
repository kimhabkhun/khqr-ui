// import { Button } from "@khqr-ui/ui";

// export default function App() {
//   return (
//     <div className="p-10 space-x-4">
//       <Button className="bg-gray-200">Default</Button>
//       <Button variant="primary" className="text-white bg-blue-600 hover:bg-blue-700">
//         Primary
//       </Button>
//     </div>
//   );
// }
import { KhqrQrCard } from "./components/KhqrQrCard"; // or from your package export

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen p-10 bg-neutral-100">
      <div className="w-[320px]">
        <KhqrQrCard
          receiverName="Devit Houtkeo"
          amount={1300000}
          currency="KHR"
          showCurrencySymbol={false}
          qrSrc="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=KHQR-DEMO"
        />
      </div>
    </div>
  );
}