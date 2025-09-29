Super Word Kingdom (Super Encrypted Wordle)![GitHub license](https://img.shields.io/github/license/Coinbol/super-word-kingdom) (LICENSE)
![Zama FHEVM](https://img.shields.io/badge/Zama-FHEVM-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-orange)Super Word Kingdom (kod adıyla Super Encrypted Wordle), Zama'nın Fully Homomorphic Encryption Virtual Machine (FHEVM) teknolojisini kullanan yenilikçi bir Web3 projesidir. Bu proje, klasik Wordle benzeri bir kelime tahmin oyununu blockchain tabanlı bir sosyal ekosisteme dönüştürür. Oyuncular, gizlilik odaklı (FHE ile şifreli) tahminler yaparak puan kazanır, grup sohbetlerinde etkileşim kurar, oylamalarla krallık kararları alır ve NFT'ler aracılığıyla oyun içi başarılarını (kelime NFT'leri) takas eder. Kripto entegrasyonu ile ödüller dağıtılır – Zama jürileri tarafından "love it!" denen bu prototip, gizliliği korurken eğlenceli bir "kelime krallığı" deneyimi sunar!Proje ÖzellikleriŞifreli Kelime Oyunu (Wordle Mekaniği): 5 harfli kelime tahmin et, FHE ile gizli feedback al (doğru/yanlış pozisyonlar şifreli hesaplanır).
Grup Sohbeti: FHEVM ile uçtan uca şifreli mesajlaşma – blockchain'de sakla, sadece yetkili decrypt etsin.
Oylama Sistemi: Manipülasyonsuz, şifreli oylar (örn: "En iyi kelime kuralı?") – homomorfik toplama ile sonuçlar.
Kripto Entegrasyonu: Ethereum token'ları ile giriş ücretleri/ödüller (Sepolia testnet destekli).
NFT Pazaryeri: Başarılı tahminler için ERC-721 NFT mint et, ETH ile sat.
Gizlilik Odaklı: Tüm veriler (tahminler, oylar, mesajlar) şifreli işlenir – Zama Concrete SDK ile entegre.

Proje, erken aşama prototip niteliğindedir ve Zama Confidential AI Hackathon 2025'ten ilham alır. Solidity 0.8.20+ ile yazılmış, Hardhat ile geliştirilmiş.Teknoloji YığınıBackend: Solidity (Smart Contracts), Hardhat (Derleme/Test/Deploy), Zama FHEVM (Gizlilik).
Test: Mocha/Chai (Unit/Integration).
Deploy: Sepolia Testnet (Infura RPC), Etherscan Verify.
Gelecek: React Frontend (MetaMask entegrasyonu ile).

Kurulum Rehberi (GitHub Codespaces İçin)Bu rehber, projeyi GitHub Codespaces'te çalıştırmak için tasarlandı. Kopyala-yapıştır komutları ile adım adım ilerle. Varsayımlar: Node.js 18+ (Codespaces'te varsayılan), MetaMask cüzdanı (test ETH için), Zama hesabı (FHE key için).Ön KoşullarGitHub hesabı (repo'yu fork'la: super-word-kingdom).
MetaMask: Sepolia ağı ekle, test ETH al Sepolia Faucet.
Zama: Ücretsiz hesap aç zama.ai, Concrete key al.
Infura: Ücretsiz proje oluştur infura.io, Sepolia RPC URL al.
Etherscan: API key al etherscan.io/apis.

Adım 1: Codespaces'i AçGitHub'da repo sayfasına git: https://github.com/Coinbol/super-word-kingdom.
Sağ üstte yeşil "Code" butonu > "Codespaces" sekmesi > "Create codespace on main".(İlk 60 dakika ücretsiz; GitHub Pro için sınırsız.)

Codespaces açıldığında, VS Code benzeri arayüz gelecek. Terminal aç (Ctrl+` veya Terminal > New Terminal).

Adım 2: Dependencies Yükle ve Environment AyarlaTerminal'de şu komutları kopyala-yapıştır (her bloğu tek seferde çalıştır, Enter'a bas):

# Repo'yu güncelle (eğer fork'ladıysan)
git pull origin main

# Node.js ve npm kontrol et (Codespaces'te yüklü)
node --version  # Çıktı: v18+ bekle
npm --version   # Çıktı: 8+ bekle

# Proje dependencies'leri yükle (Hardhat, ethers, openzeppelin, zama)
npm install

# Environment dosyasını oluştur ve doldur (.env.example'dan kopyala)
cp .env.example .env
# Şimdi .env'yi editörle aç (VS Code'da Ctrl+P > .env) ve doldur:
# ETHERSCAN_API_KEY=your_key
# PRIVATE_KEY=0x_your_metamask_private_key
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
# ZAMA_CONCRETE_KEY=your_zama_key

Adım 3: Smart Contract'ları Derle ve Test EtTerminal'de:

# Hardhat ile derle (Solidity + FHE placeholder'ları)
npx hardhat compile

# Unit test'leri çalıştır (SuperWordle.test.js)
npx hardhat test test/SuperWordle.test.js

# Integration test'leri çalıştır (tam akış: deploy + tahmin + oylama)
npx hardhat test test/SuperWordleIntegration.test.js

# Zama FHE devresini compile et (eğer circuits klasörü varsa, yoksa atla)
# pip install concrete-compiler  # Eğer yüklü değilse
# concrete compile contracts/SuperEncryptedWordle.fhe  # FHE devresi (prototipte placeholder)

Beklenen Çıktı: Test'ler geçerse "All tests passed" göreceksin. Hata varsa: npx hardhat clean && npx hardhat compile tekrarla.

Adım 4: Contract'ları Deploy Et (Sepolia Testnet)Terminal'de:

# Deploy script'ini çalıştır (SuperEncryptedWordle deploy eder)
npx hardhat run scripts/deploy.js --network sepolia

# Kelime listesini setup et (Wordle words yükle)
npx hardhat run scripts/setupWords.js --network sepolia

# Deploy sonrası verify et (Etherscan'da source code göster)
npx hardhat run scripts/verify.js --network sepolia

Beklenen Çıktı: Konsola contract adresi yazılır (örn: "SuperEncryptedWordle deployed to: 0x123..."). .env'ye WORDLE_CONTRACT_ADDRESS=0x123... ekle.
Gaz Maliyeti: Test ETH yeterli (0.01-0.1 ETH).

Adım 5: Projeyi Test Et ve OynaLocal Test: Hardhat node başlat (fork için): npx hardhat node (ayrı terminal), sonra npx hardhat run scripts/deploy.js --network localhost.
Oyun Akışı:MetaMask ile bağlan (Sepolia).
submitGuess("hello") – Şifreli tahmin, event emit.
createPoll("En iyi kelime?") – Oylama başlat.
mintGuessNFT("world", 100) – NFT mint et.

FHE Test: Zama docs'tan docs.zama.ai decrypt fonksiyonu ekle.

Adım 6: Geliştirme ve DebugWatch Mode: npx hardhat watch (değişiklikleri otomatik derle).
Gaz Optimizasyon: npx hardhat run scripts/deploy.js --network sepolia --show-stack-traces.
Frontend Entegrasyonu (Opsiyonel): React app ekle – cd frontend && npm install && npm start (port 3000'i Codespaces Ports'ta public yap).

Sorun GidermeSorun
Çözüm
npm install hatası
rm -rf node_modules && npm install
Hardhat compile hatası
Solidity versiyonu kontrol et (hardhat.config.js), npx hardhat clean
Zama FHE compile hatası
pip install --upgrade concrete-compiler, docs.zama.ai/docs/concrete
Deploy RPC hatası
.env'de SEPOLIA_RPC_URL kontrol et, Infura key yenile
Test ETH yok
faucet.sepolia.dev kullan
Codespaces yavaş
RAM artır (Codespace Settings > Machine type)

Smart Contract'lar HakkındaSuperEncryptedWordle.sol: Ana contract – tahmin, oylama, NFT mint. FHE ile submitEncryptedGuess(bytes calldata encryptedGuess).
IWordle.sol: Interface – event'ler ve fonksiyon signature'ları.

Katkı ve LisansFork'la, PR aç! Issues için yeni issue oluştur.
Lisans: MIT – LICENSE detayları.Bu README, 29 Eylül 2025 itibarıyla günceldir. Zama FHEVM docs: docs.zama.ai. Sorun için: @Coinbol
 on X. (Kopyala-yapıştır için: Bu metni GitHub'da "Add file > Create new file > README.md" ile yapıştır, veya Codespaces'te echo "..." > README.md ile güncelle.)

