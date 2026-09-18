export const FLUTTER_MAIN_DART = `// Zakat Calculator Pakistan - Complete Flutter Source Code
// Ready for Android Play Store (Material 3, Provider State Management, Offline, PKR Currency)
// File: lib/main.dart

import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(
    ChangeNotifierProvider(
      create: (_) => ZakatProvider(),
      child: const ZakatApp(),
    ),
  );
}

class ZakatApp extends StatelessWidget {
  const ZakatApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Refined Typography Pairing: Outfit for Headings, Manrope with Tabular Numbers for Body
    final baseTextTheme = GoogleFonts.manropeTextTheme(Theme.of(context).textTheme);
    final appTextTheme = baseTextTheme.copyWith(
      displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      titleLarge: GoogleFonts.outfit(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      titleMedium: GoogleFonts.outfit(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.w600, letterSpacing: 0.2),
      bodyLarge: GoogleFonts.manrope(
        fontFeatures: const [FontFeature.tabularFigures()],
        height: 1.48,
      ),
      bodyMedium: GoogleFonts.manrope(
        fontFeatures: const [FontFeature.tabularFigures()],
        height: 1.48,
      ),
    );

    return MaterialApp(
      title: 'Zakat Calculator Pakistan',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        textTheme: appTextTheme,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F4C3A), // Islamic Emerald Green
          primary: const Color(0xFF0F4C3A),
          secondary: const Color(0xFFC59B27), // Gold Accent
          surface: const Color(0xFFF9FBF9),
        ),
        cardTheme: CardTheme(
          elevation: 1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        appBarTheme: AppBarTheme(
          centerTitle: true,
          backgroundColor: const Color(0xFF0F4C3A),
          foregroundColor: Colors.white,
          elevation: 0,
          titleTextStyle: GoogleFonts.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
            color: Colors.white,
          ),
        ),
      ),
      home: const QuranicSplashScreen(),
    );
  }
}

// ---------------- QURANIC SPLASH SCREEN ----------------

class QuranicSplashScreen extends StatefulWidget {
  const QuranicSplashScreen({super.key});

  @override
  State<QuranicSplashScreen> createState() => _QuranicSplashScreenState();
}

class _QuranicSplashScreenState extends State<QuranicSplashScreen>
    with SingleTickerProviderStateMixin {
  late final Map<String, String> _ayah;
  late final AnimationController _controller;
  bool _canSkip = false;
  Timer? _skipTimer;

  static const List<Map<String, String>> _zakatAyat = [
    {
      'reference': 'Surah Al-Baqarah 2:43',
      'translation':
          'And establish prayer and give zakah and bow with those who bow [in worship and obedience].',
      'translator': 'Sahih International',
    },
    {
      'reference': 'Surah At-Tawbah 9:60',
      'translation':
          'Zakah expenditures are only for the poor and for the needy and for those employed to collect [zakah] and for bringing hearts together [for Islam] and for freeing captives [or slaves] and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah. And Allah is Knowing and Wise.',
      'translator': 'Sahih International',
    },
    {
      'reference': 'Surah At-Tawbah 9:103',
      'translation':
          'Take, [O Muhammad], from their wealth a charity by which you purify them and cause them increase, and invoke [Allah\\'s blessings] upon them. Indeed, your invocations are reassurance for them. And Allah is Hearing and Knowing.',
      'translator': 'Sahih International',
    },
    {
      'reference': 'Surah Al-Baqarah 2:267',
      'translation':
          'O you who have believed, spend from the good things which you have earned and from that which We have produced for you from the earth. And do not aim toward the defective therefrom, spending [from that] while you would not take it [yourself] except with closed eyes. And know that Allah is Free of need and Praiseworthy.',
      'translator': 'Sahih International',
    },
    {
      'reference': 'Surah Al-Ma\\'arij 70:24-25',
      'translation':
          'And those within whose wealth is a known right, for the petitioner and the deprived -',
      'translator': 'Sahih International',
    },
    {
      'reference': 'Surah Ar-Rum 30:39',
      'translation':
          'And whatever you give for interest to increase within the wealth of people will not increase with Allah. But what you give in zakah, desiring the face [i.e., approval] of Allah - those are the multipliers.',
      'translator': 'Sahih International',
    },
  ];

  @override
  void initState() {
    super.initState();
    _ayah = _zakatAyat[Random().nextInt(_zakatAyat.length)];

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3800),
    )..forward();

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _navigateToHome();
      }
    });

    _skipTimer = Timer(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _canSkip = true;
        });
      }
    });
  }

  void _navigateToHome() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 500),
        pageBuilder: (context, animation, secondaryAnimation) =>
            const MainNavigationScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    _skipTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF061A14),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _canSkip ? _navigateToHome : null,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F4C3A),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFFC59B27).withOpacity(0.5),
                        ),
                      ),
                      child: const Icon(
                        Icons.menu_book,
                        color: Color(0xFFFFE082),
                        size: 28,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Zakat Calculator Pakistan',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                      style: TextStyle(fontSize: 12, color: Color(0xFFA7F3D0)),
                    ),
                  ],
                ),
                Container(
                  constraints: const BoxConstraints(maxHeight: 340),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF0F4C3A).withOpacity(0.6),
                    ),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '"\${_ayah['translation']}"',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 14,
                            fontStyle: FontStyle.italic,
                            height: 1.5,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _ayah['reference']!,
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFFFE082),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '— \${_ayah['translator']}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Column(
                  children: [
                    AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: SizedBox(
                            width: 240,
                            height: 6,
                            child: LinearProgressIndicator(
                              value: _controller.value,
                              backgroundColor: Colors.black54,
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(0xFFC59B27),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 28,
                      child: _canSkip
                          ? TextButton(
                              onPressed: _navigateToHome,
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFFA7F3D0),
                                textStyle: const TextStyle(fontSize: 12),
                              ),
                              child: const Text('Tap to skip →'),
                            )
                          : const Text(
                              'Loading calculator...',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.white38,
                              ),
                            ),
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}


// ---------------- MODEL & STATE MANAGEMENT ----------------

enum GoldPurity { k24, k22, k21, k18 }
enum NisabMethod { silver, gold }

class ZakatProvider extends ChangeNotifier {
  // Input fields
  double cashSavings = 0.0;
  double goldGrams = 0.0;
  GoldPurity goldPurity = GoldPurity.k24;
  double goldRatePerGram = 26500.0; // Current PKR rate for 24K gold
  double silverGrams = 0.0;
  double silverRatePerGram = 310.0; // Current PKR rate for fine silver
  double businessValue = 0.0;
  double liabilities = 0.0;

  // Settings
  NisabMethod nisabMethod = NisabMethod.silver;

  static const double goldNisabGrams = 87.48; // 7.5 Tolas
  static const double silverNisabGrams = 612.36; // 52.5 Tolas

  double get purityFactor {
    switch (goldPurity) {
      case GoldPurity.k24: return 1.0;
      case GoldPurity.k22: return 22 / 24;
      case GoldPurity.k21: return 21 / 24;
      case GoldPurity.k18: return 18 / 24;
    }
  }

  double get goldPureGrams => goldGrams * purityFactor;
  double get goldValue => goldPureGrams * goldRatePerGram;
  double get silverValue => silverGrams * silverRatePerGram;
  double get totalAssets => cashSavings + goldValue + silverValue + businessValue;
  double get netWealth => (totalAssets - liabilities) > 0 ? (totalAssets - liabilities) : 0.0;

  double get nisabThresholdPKR {
    if (nisabMethod == NisabMethod.gold) {
      return goldNisabGrams * goldRatePerGram;
    } else {
      return silverNisabGrams * silverRatePerGram;
    }
  }

  bool get isEligible => netWealth >= nisabThresholdPKR && nisabThresholdPKR > 0;
  double get zakatDue => isEligible ? (netWealth * 0.025) : 0.0;
  double get shortfall => isEligible ? 0.0 : (nisabThresholdPKR - netWealth);

  void updateCash(double val) { cashSavings = val; notifyListeners(); }
  void updateGoldGrams(double val) { goldGrams = val; notifyListeners(); }
  void updateGoldPurity(GoldPurity p) { goldPurity = p; notifyListeners(); }
  void updateGoldRate(double val) { goldRatePerGram = val; notifyListeners(); }
  void updateSilverGrams(double val) { silverGrams = val; notifyListeners(); }
  void updateSilverRate(double val) { silverRatePerGram = val; notifyListeners(); }
  void updateBusiness(double val) { businessValue = val; notifyListeners(); }
  void updateLiabilities(double val) { liabilities = val; notifyListeners(); }
  void updateNisabMethod(NisabMethod m) { nisabMethod = m; notifyListeners(); }

  void resetAll() {
    cashSavings = 0.0;
    goldGrams = 0.0;
    silverGrams = 0.0;
    businessValue = 0.0;
    liabilities = 0.0;
    notifyListeners();
  }
}

// ---------------- ROOT NAVIGATION SCREEN ----------------

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const InputScreen(),
    const ResultScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.edit_note_outlined),
            selectedIcon: Icon(Icons.edit_note),
            label: 'Calculator',
          ),
          NavigationDestination(
            icon: Icon(Icons.assessment_outlined),
            selectedIcon: Icon(Icons.assessment),
            label: 'Result',
          ),
          NavigationDestination(
            icon: Icon(Icons.tune_outlined),
            selectedIcon: Icon(Icons.tune),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}

// ---------------- SCREEN 1: INPUT SCREEN ----------------

class InputScreen extends StatelessWidget {
  const InputScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'en_PK', symbol: 'PKR ', decimalDigits: 0);
    final zakat = context.watch<ZakatProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Zakat Calculator Pakistan', style: TextStyle(fontWeight: FontWeight.w600)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Reset Inputs',
            onPressed: () => zakat.resetAll(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Market Rates Tooltip Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F8F5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFC3DACF)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Color(0xFF0F4C3A), size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Tip: Please check today\\'s local Sarafa market rates in Pakistan before calculating.',
                          style: TextStyle(fontSize: 13, color: Colors.grey[800]),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Cash & Bank Savings
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.account_balance_wallet, color: Color(0xFF0F4C3A)),
                            SizedBox(width: 8),
                            Text('Cash & Bank Savings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Cash in Hand & Bank Accounts (PKR)',
                            prefixText: 'PKR ',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (val) => zakat.updateCash(double.tryParse(val) ?? 0.0),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Gold Assets
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.workspace_premium, color: Color(0xFFC59B27)),
                            SizedBox(width: 8),
                            Text('Gold Assets', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: TextFormField(
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(
                                  labelText: 'Weight (Grams)',
                                  border: OutlineInputBorder(),
                                  suffixText: 'g',
                                ),
                                onChanged: (val) => zakat.updateGoldGrams(double.tryParse(val) ?? 0.0),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: DropdownButtonFormField<GoldPurity>(
                                value: zakat.goldPurity,
                                decoration: const InputDecoration(
                                  labelText: 'Purity',
                                  border: OutlineInputBorder(),
                                ),
                                items: GoldPurity.values.map((p) {
                                  return DropdownMenuItem(
                                    value: p,
                                    child: Text(p.name.substring(1).toUpperCase() + 'K'),
                                  );
                                }).toList(),
                                onChanged: (p) => zakat.updateGoldPurity(p ?? GoldPurity.k24),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          initialValue: zakat.goldRatePerGram.toStringAsFixed(0),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: '24K Gold Rate per Gram (PKR)',
                            prefixText: 'PKR ',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (val) => zakat.updateGoldRate(double.tryParse(val) ?? 0.0),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Silver Assets
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.toll, color: Colors.blueGrey),
                            SizedBox(width: 8),
                            Text('Silver Assets', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Silver Weight (Grams)',
                            border: OutlineInputBorder(),
                            suffixText: 'g',
                          ),
                          onChanged: (val) => zakat.updateSilverGrams(double.tryParse(val) ?? 0.0),
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          initialValue: zakat.silverRatePerGram.toStringAsFixed(0),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Silver Rate per Gram (PKR)',
                            prefixText: 'PKR ',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (val) => zakat.updateSilverRate(double.tryParse(val) ?? 0.0),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Business & Investment
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.storefront, color: Color(0xFF0F4C3A)),
                            SizedBox(width: 8),
                            Text('Business & Investments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Trade Stock & Liquid Assets (PKR)',
                            prefixText: 'PKR ',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (val) => zakat.updateBusiness(double.tryParse(val) ?? 0.0),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Liabilities
                Card(
                  color: const Color(0xFFFFF7F7),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.credit_card_off, color: Colors.redAccent),
                            SizedBox(width: 8),
                            Text('Short-term Debts & Liabilities', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Total Debts Currently Owed (PKR)',
                            prefixText: 'PKR ',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (val) => zakat.updateLiabilities(double.tryParse(val) ?? 0.0),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 90),
              ],
            ),
          ),
          // Live Sticky Running Total Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, -3)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Net Zakatable Wealth', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Text(
                      currency.format(zakat.netWealth),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F4C3A)),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F4C3A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    // Navigate to Result Screen
                  },
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('View Result'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------- SCREEN 2: RESULT SCREEN ----------------

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final zakat = context.watch<ZakatProvider>();
    final currency = NumberFormat.currency(locale: 'en_PK', symbol: 'PKR ', decimalDigits: 0);
    final isEligible = zakat.isEligible;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Zakat Calculation Result'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Banner Status
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isEligible ? const Color(0xFF0F4C3A) : const Color(0xFFB45309),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                Icon(
                  isEligible ? Icons.verified : Icons.info_outline,
                  color: Colors.white,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  isEligible ? 'Zakat is Mandatory' : 'Not Eligible for Zakat',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  isEligible ? 'Your net wealth meets or exceeds the Nisab threshold.' : 'Your net wealth is below the applicable Nisab threshold.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const Divider(color: Colors.white24, height: 32),
                const Text('TOTAL ZAKAT DUE (2.5%)', style: TextStyle(color: Colors.white70, fontSize: 13, letterSpacing: 1.1)),
                const SizedBox(height: 6),
                Text(
                  currency.format(zakat.zakatDue),
                  style: const TextStyle(color: Color(0xFFFFE082), fontSize: 32, fontWeight: FontWeight.bold),
                ),
                if (!isEligible) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Shortfall to reach Nisab: \${currency.format(zakat.shortfall)}',
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Breakdown List
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Wealth & Nisab Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildRow('Total Gross Assets', currency.format(zakat.totalAssets), Icons.account_balance),
                  _buildRow('Total Deductible Debts', currency.format(zakat.liabilities), Icons.remove_circle_outline, isNegative: true),
                  const Divider(),
                  _buildRow('Net Zakatable Wealth', currency.format(zakat.netWealth), Icons.savings, isBold: true),
                  _buildRow(
                    'Nisab Standard Used',
                    zakat.nisabMethod == NisabMethod.silver ? 'Silver (612.36g / 52.5 Tola)' : 'Gold (87.48g / 7.5 Tola)',
                    Icons.balance,
                  ),
                  _buildRow('Nisab Threshold Value', currency.format(zakat.nisabThresholdPKR), Icons.rule),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Share Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F4C3A),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: const Icon(Icons.share),
            label: const Text('Share Calculation (Text)', style: TextStyle(fontSize: 16)),
            onPressed: () {
              final text = '''
*Zakat Calculator Pakistan - Summary*
Date: \${DateFormat('dd MMM yyyy').format(DateTime.now())}
Gross Assets: \${currency.format(zakat.totalAssets)}
Liabilities: \${currency.format(zakat.liabilities)}
Net Wealth: \${currency.format(zakat.netWealth)}
Nisab Threshold: \${currency.format(zakat.nisabThresholdPKR)}
Status: \${isEligible ? 'Eligible' : 'Not Eligible'}
Total Zakat Due (2.5%): \${currency.format(zakat.zakatDue)}
''';
              Share.share(text);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, IconData icon, {bool isNegative = false, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[700]),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: TextStyle(fontSize: 14, fontWeight: isBold ? FontWeight.bold : FontWeight.normal))),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
              color: isNegative ? Colors.redAccent : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------- SCREEN 3: SETTINGS SCREEN ----------------

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final zakat = context.watch<ZakatProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings & Nisab Method'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Nisab Standard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text(
                    'Select which Nisab threshold to apply to your calculation. In Pakistan, scholars overwhelmingly recommend the Silver Nisab so that more impoverished families receive assistance.',
                    style: TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                  const SizedBox(height: 16),
                  RadioListTile<NisabMethod>(
                    title: const Text('Silver Nisab (Recommended)'),
                    subtitle: const Text('612.36 grams (52.5 Tolas)'),
                    value: NisabMethod.silver,
                    groupValue: zakat.nisabMethod,
                    onChanged: (val) => zakat.updateNisabMethod(val!),
                  ),
                  RadioListTile<NisabMethod>(
                    title: const Text('Gold Nisab'),
                    subtitle: const Text('87.48 grams (7.5 Tolas)'),
                    value: NisabMethod.gold,
                    groupValue: zakat.nisabMethod,
                    onChanged: (val) => zakat.updateNisabMethod(val!),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('About Zakat in Pakistan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text(
                    '• Hawl: Zakat is due after holding wealth equal to or exceeding Nisab for one complete lunar year (Hawl).\\n'
                    '• Rate: 2.5% (1/40th) of total net zakatable wealth.\\n'
                    '• Excluded: Personal residence, personal car, everyday clothes, tools of trade are exempt.',
                    style: TextStyle(fontSize: 13, height: 1.5, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`;

export const PUBSPEC_YAML = `name: zakat_calculator_pakistan
description: A clean Material 3 Zakat Calculator app for Android (Pakistan, PKR currency).
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  intl: ^0.19.0
  share_plus: ^10.1.3
  google_fonts: ^6.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;
