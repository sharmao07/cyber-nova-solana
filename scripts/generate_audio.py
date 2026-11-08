#!/usr/bin/env python3
"""
Synthesizes a 90.00-second 48kHz stereo soundtrack for CYBER NOVA: Sol-Jet Velocity.
Features driving 128 BPM retro-cyber synthwave with synchronized in-game audio effects:
jetpack thrusters, shard chimes, missile warning sirens, hazard crash, and Solana attestation fanfare.
"""

import math
import struct
import wave
import random

SAMPLE_RATE = 48000
TOTAL_DURATION = 90.0  # Exactly 90 seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_DURATION)

def clamp(v, min_v=-1.0, max_v=1.0):
    return max(min_v, min(max_v, v))

def main():
    print(f"Generating 90.00s soundtrack ({TOTAL_SAMPLES} samples @ {SAMPLE_RATE}Hz)...")
    
    # 128 BPM timing
    bpm = 128.0
    beat_dur = 60.0 / bpm  # ~0.46875s
    sixteenth_dur = beat_dur / 4.0

    # Chords progression: Dm -> Bb -> F -> C
    chord_roots = [146.83, 116.54, 174.61, 130.81] # D3, Bb2, F3, C3
    arpeggio_notes = [
        [293.66, 349.23, 440.0, 587.33],  # Dm: D4, F4, A4, D5
        [233.08, 293.66, 349.23, 466.16], # Bb: Bb3, D4, F4, Bb4
        [349.23, 440.0, 523.25, 698.46],  # F:  F4, A4, C5, F5
        [261.63, 329.63, 392.0, 523.25]   # C:  C4, E4, G4, C5
    ]

    # Pre-generate noise table
    noise_table = [random.uniform(-1.0, 1.0) for _ in range(SAMPLE_RATE)]

    audio_left = [0.0] * TOTAL_SAMPLES
    audio_right = [0.0] * TOTAL_SAMPLES

    # Synthesis loop
    for i in range(TOTAL_SAMPLES):
        t = i / SAMPLE_RATE

        # Master Envelope (fade-in 1.0s, fade-out 2.5s)
        master_vol = 1.0
        if t < 1.0:
            master_vol = t / 1.0
        elif t > 87.5:
            master_vol = max(0.0, (90.0 - t) / 2.5)

        # Global Musical Bar (4 beats per chord = ~1.875s)
        chord_idx = int(t / (beat_dur * 4)) % len(chord_roots)
        root_freq = chord_roots[chord_idx]
        chord_arp = arpeggio_notes[chord_idx]

        # 1. Rolling 16th Synth Bass
        sixteenth_step = int(t / sixteenth_dur) % 16
        bass_env = math.exp(-((t % sixteenth_dur) / sixteenth_dur) * 3.5)
        # Octave jumps on 16th notes
        octave_mult = 1.0 if sixteenth_step % 2 == 0 else 2.0
        bass_phase = 2.0 * math.pi * (root_freq * 0.5 * octave_mult) * t
        bass_wave = (math.sin(bass_phase) + 0.5 * math.sin(bass_phase * 2.0)) * bass_env * 0.22

        # 2. Cascading Cyber Arpeggio (8th note pulse)
        arp_note_idx = int(t / (sixteenth_dur * 2)) % len(chord_arp)
        arp_freq = chord_arp[arp_note_idx]
        arp_env = math.exp(-((t % (sixteenth_dur * 2)) / (sixteenth_dur * 2)) * 4.0)
        arp_phase = 2.0 * math.pi * arp_freq * t
        # Square wave with rounded harmonics
        arp_wave = (math.sin(arp_phase) + 0.33 * math.sin(arp_phase * 3.0)) * arp_env * 0.14

        # 3. Soft Hi-Hat & Kick Drum Pulse
        beat_time = t % beat_dur
        kick_env = math.exp(-beat_time * 16.0) if beat_time < 0.25 else 0.0
        kick_freq = 120.0 * math.exp(-beat_time * 25.0) + 45.0
        kick = math.sin(2.0 * math.pi * kick_freq * t) * kick_env * 0.35

        hat_time = t % (beat_dur / 2.0)
        hat_env = math.exp(-hat_time * 45.0) if hat_time < 0.08 else 0.0
        hat = noise_table[i % len(noise_table)] * hat_env * 0.08

        # 4. In-Game SFX Layer (Synchronized to video timeline)
        sfx_left = 0.0
        sfx_right = 0.0

        # Jetpack Thruster Sound (Active during gameplay: 15s - 35s, 38s - 48s, 52s - 65s)
        is_thrusting = (
            (16.0 <= t <= 17.5) or (19.0 <= t <= 21.0) or (23.5 <= t <= 25.5) or
            (28.0 <= t <= 30.5) or (33.0 <= t <= 34.5) or (39.0 <= t <= 41.0) or
            (44.0 <= t <= 47.0) or (53.0 <= t <= 55.5) or (58.0 <= t <= 62.0)
        )
        if is_thrusting:
            thrust_noise = noise_table[i % len(noise_table)] * 0.09
            thrust_hum = math.sin(2.0 * math.pi * 110.0 * t) * 0.06
            sfx_left += (thrust_noise + thrust_hum)
            sfx_right += (thrust_noise + thrust_hum)

        # Solana Shard Collect Chimes (Chimes every ~2 seconds during run)
        shard_times = [17.2, 19.8, 22.4, 25.0, 27.8, 30.2, 33.6, 40.5, 43.2, 54.8, 59.2, 62.5]
        for st in shard_times:
            dt = t - st
            if 0.0 <= dt <= 0.18:
                chime_env = math.exp(-dt * 18.0)
                chime = math.sin(2.0 * math.pi * (1046.5 + dt * 400.0) * t) * chime_env * 0.18
                sfx_left += chime * 0.8
                sfx_right += chime * 1.2

        # Speed Booster Warp Sound (At 36.5s)
        if 36.5 <= t <= 38.0:
            w_dt = t - 36.5
            warp_freq = 200.0 + w_dt * 800.0
            warp_env = math.sin(w_dt / 1.5 * math.pi)
            warp = math.sin(2.0 * math.pi * warp_freq * t) * warp_env * 0.16
            sfx_left += warp
            sfx_right += warp

        # Vehicle Boarding Jingle (At 41.5s)
        if 41.5 <= t <= 42.5:
            v_dt = t - 41.5
            v_step = int(v_dt / 0.12)
            v_notes = [523.25, 659.25, 783.99, 1046.5]
            if v_step < len(v_notes):
                v_env = math.exp(-(v_dt % 0.12) * 15.0)
                v_sound = math.sin(2.0 * math.pi * v_notes[v_step] * t) * v_env * 0.18
                sfx_left += v_sound
                sfx_right += v_sound

        # Homing Missile Alarm [ ! ] (51.5s - 54.5s)
        if 51.5 <= t <= 54.5:
            m_dt = t - 51.5
            beep_step = (m_dt % 0.35)
            if beep_step < 0.12:
                beep = math.sin(2.0 * math.pi * 880.0 * t) * 0.15
                sfx_left += beep
                sfx_right += beep

        # Hazard Crash Impact (At 65.2s)
        if 65.2 <= t <= 66.8:
            c_dt = t - 65.2
            crash_env = math.exp(-c_dt * 5.0)
            crash_noise = noise_table[i % len(noise_table)] * crash_env * 0.30
            crash_boom = math.sin(2.0 * math.pi * (80.0 * math.exp(-c_dt * 8.0)) * t) * crash_env * 0.40
            sfx_left += crash_noise + crash_boom
            sfx_right += crash_noise + crash_boom

        # Solana Attestation Success Fanfare (At 71.0s - 73.0s)
        if 71.0 <= t <= 73.5:
            a_dt = t - 71.0
            a_step = int(a_dt / 0.18)
            fanfare_notes = [440.0, 554.37, 659.25, 880.0] # A major triad
            if a_step < len(fanfare_notes):
                fanfare_env = math.exp(-(a_dt % 0.18) * 8.0)
                fanfare = math.sin(2.0 * math.pi * fanfare_notes[a_step] * t) * fanfare_env * 0.22
                sfx_left += fanfare
                sfx_right += fanfare

        # Mix channels
        music_l = (bass_wave + arp_wave * 0.8 + kick * 0.9 + hat * 0.7) * master_vol
        music_r = (bass_wave + arp_wave * 1.1 + kick * 0.9 + hat * 1.1) * master_vol

        final_l = clamp(music_l + sfx_left * master_vol)
        final_r = clamp(music_r + sfx_right * master_vol)

        audio_left[i] = final_l
        audio_right[i] = final_r

    # Write WAV file
    output_path = "/tmp/cyber_nova_soundtrack_90s.wav"
    out_wav = wave.open(output_path, "w")
    out_wav.setnchannels(2)
    out_wav.setsampwidth(2)
    out_wav.setframerate(SAMPLE_RATE)

    raw_bytes = bytearray()
    for i in range(TOTAL_SAMPLES):
        int_l = int(audio_left[i] * 32767.0)
        int_r = int(audio_right[i] * 32767.0)
        raw_bytes += struct.pack("<hh", int_l, int_r)

    out_wav.writeframes(raw_bytes)
    out_wav.close()
    print(f"Successfully generated {output_path} (exact duration: {TOTAL_DURATION}s)")

if __name__ == "__main__":
    main()
