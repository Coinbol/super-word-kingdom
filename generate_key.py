from concrete import fhe

# Örnek devre tanımla (Wordle benzeri basit logic için)
@fhe.compiler({"guess": "encrypted", "target": "encrypted"})
def wordle_check(guess, target):
    # Basit örnek: Harf karşılaştırması (gerçekte Wordle logic'i buraya koy)
    return guess == target  # Veya daha karmaşık FHE işlemleri

# Test input seti
inputset = [(i, i) for i in range(26)]  # A-Z harfleri için örnek

# Devreyi derle ve anahtar üret
circuit = wordle_check.compile(inputset)
circuit.keys.generate()  # Anahtarı üret

# Evaluation keys'i serialize et ve kaydet (binary dosya)
evaluation_keys = circuit.keys.evaluation
with open("zama_concrete_key.json", "wb") as f:
    f.write(evaluation_keys.serialize())

print("Anahtar üretildi: zama_concrete_key.json (binary serialized)")
