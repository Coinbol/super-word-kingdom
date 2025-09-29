from concrete import fhe

@fhe.compiler({"guess": "encrypted", "target": "encrypted"})
def wordle_check(guess, target):
    return guess == target  # Basit Wordle karşılaştırması

inputset = [(i, i) for i in range(26)]  # A-Z için örnek

circuit = wordle_check.compile(inputset)
circuit.keys.generate()

evaluation_keys = circuit.keys.evaluation
evaluation_keys.dump("zama_concrete_key.json")

print("Anahtar hazır: zama_concrete_key.json")
