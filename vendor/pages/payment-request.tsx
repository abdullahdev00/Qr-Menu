import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Smartphone, Building } from "lucide-react";

export default function PaymentRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Request Page
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Jald Aa Raha Hai
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-center">
              Payment Ki Malomaat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">
                Hum bohat jald is page ko online kar denge. Fi al-waqt aap is WhatsApp number par payment receipt send kar dein.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <div className="text-center">
                    <p className="font-semibold text-green-800 dark:text-green-200">WhatsApp Number</p>
                    <p className="text-xl font-bold text-green-600">03054288892</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-center gap-2">
                    <Building className="w-5 h-5" />
                    Payment Banking Tafseelatات
                  </h3>
                  <div className="space-y-2 text-center">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Account Holder:</span> Muhammad Abdullah
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Raast ID:</span> 03054288892
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Mobile:</span> 03054288892
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Payment receipt ke saath apna restaurant name aur order details bhi send karein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}