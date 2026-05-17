import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

interface UploadReceiptModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'camera' | 'gallery') => void;
}

export default function UploadReceiptModal({ isVisible, onClose, onSelectOption }: UploadReceiptModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleSelect = (option: 'camera' | 'gallery') => {
    setStatus('uploading');
    // Simulate upload
    setTimeout(() => {
      setStatus('success');
      onSelectOption(option);
    }, 1500);
  };

  const handleClose = () => {
    setStatus('idle');
    onClose();
  };

  const handleViewTaxExemption = () => {
    handleClose();
    router.push({ pathname: '/modals/summary', params: { tab: 'tax' } } as any);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={status === 'success' ? undefined : handleClose}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          {status === 'idle' && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.innerContent}>
              <View style={styles.handle} />
              <Text style={[styles.title, { color: colors.text }]}>Upload Proof of Receipt</Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>
                Save your receipt now to make tax season effortless later.
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.optionBtn, { backgroundColor: 'rgba(119, 31, 255, 0.05)', borderColor: 'rgba(119, 31, 255, 0.2)' }]}
                  onPress={() => handleSelect('camera')}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="camera" size={28} color="#771FFF" />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>Take a Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.optionBtn, { backgroundColor: 'rgba(119, 31, 255, 0.05)', borderColor: 'rgba(119, 31, 255, 0.2)' }]}
                  onPress={() => handleSelect('gallery')}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="images" size={28} color="#771FFF" />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {status === 'uploading' && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#771FFF" />
              <Text style={[styles.loadingText, { color: colors.text }]}>Uploading Receipt...</Text>
            </Animated.View>
          )}

          {status === 'success' && (
            <Animated.View entering={ZoomIn} style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={64} color="#15fabd" />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>Upload Successful!</Text>
              <Text style={[styles.successSubtitle, { color: colors.secondary }]}>
                The item has been added to your tax exemption profile.
              </Text>

              <TouchableOpacity 
                style={[styles.viewTaxBtn, { backgroundColor: '#771FFF' }]}
                onPress={handleViewTaxExemption}
              >
                <Text style={styles.viewTaxBtnText}>View Tax Exemption</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={[styles.doneBtnText, { color: colors.secondary }]}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  optionBtn: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#771FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  cancelBtn: {
    marginTop: 8,
    padding: 12,
  },
  cancelText: {
    color: '#FB7185',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconCircle: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  viewTaxBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  viewTaxBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  doneBtn: {
    padding: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
});
