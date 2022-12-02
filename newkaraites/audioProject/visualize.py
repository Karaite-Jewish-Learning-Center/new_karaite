import sys
import wave
import numpy as np
import matplotlib.pyplot as plt

wav = wave.open('../../../save_new_karaite/newkaraites/audioProject/parashat-_bereshit_-_rotem_cohen__reduced__8.wav', 'rb')
sample_freq = wav.getframerate()

print('Sample frequencies:', sample_freq)

samples = wav.getnframes()
print('Samples:', samples)

duration = samples / sample_freq
print('Durations:', duration)

channels = wav.getnchannels()
print('Channels:', channels)

signal = wav.readframes(samples)
print('Signal len:', len(signal))
signal_array = np.frombuffer(signal, dtype=np.int16)

l_channel = signal_array[0::2]
r_channel = signal_array[1::2]

times = np.linspace(0, duration, num=samples)

plt.figure(figsize=(15, 5))
plt.plot(times, l_channel, color='blue')
plt.title('Left channel')
plt.xlabel('Time (s)')
plt.ylabel('Amplitude')
plt.show()
