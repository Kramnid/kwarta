import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wallet, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { formatPhp } from '@/utils/currency';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between px-6 py-6">
          {/* Header Branding */}
          <View className="items-center mt-6">
            {/* Logo: Modern wallet icon inside emerald-green rounded square */}
            <View className="w-20 h-20 bg-emerald-500 rounded-3xl items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
              <Wallet size={40} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            {/* App Name */}
            <Text className="text-3xl font-bold text-slate-50 tracking-tight mb-1">
              Kwarta
            </Text>

            {/* Tagline */}
            <View className="flex-row items-center space-x-1.5">
              <Text className="text-emerald-400 font-semibold text-base">
                Every peso counts.
              </Text>
            </View>

            {/* Description */}
            <Text className="text-slate-400 text-center text-sm mt-3 px-4 leading-5">
              Take control of your money, track your expenses, and build better
              financial habits.
            </Text>
          </View>

          {/* Sample Balance Card */}
          <View className="my-8">
            <View
              className="bg-[#151F30] rounded-3xl p-6 border border-slate-700/60 shadow-xl overflow-hidden"
              style={{ padding: 24 }}
            >

              {/* Badge identifying sample / demo data */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  TOTAL BALANCE
                </Text>
                <View className="bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex-row items-center">
                  <Sparkles size={11} color="#10B981" />
                  <Text className="text-emerald-400 text-[10px] font-bold tracking-wide ml-1">
                    SAMPLE PREVIEW
                  </Text>
                </View>
              </View>

              {/* Formatted Currency Display */}
              <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">
                {formatPhp(12500)}
              </Text>

              {/* Subtitle */}
              <Text className="text-slate-400 text-sm font-medium">
                Your financial journey starts here.
              </Text>

              {/* Feature Highlights pill */}
              <View className="mt-5 pt-4 border-t border-slate-700/50 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <ShieldCheck size={16} color="#10B981" />
                  <Text className="text-xs text-slate-300 ml-1.5 font-medium">
                    100% Offline & Private
                  </Text>
                </View>
                <Text className="text-xs text-emerald-400 font-semibold">
                  Saved on Device
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Actions */}
          <View className="mb-2">
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              size="lg"
              rightIcon={<ArrowRight size={20} color="#FFFFFF" className="ml-2" />}
            />

            <Text className="text-slate-500 text-xs text-center mt-4">
              No registration or credit card required. Free & offline.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
