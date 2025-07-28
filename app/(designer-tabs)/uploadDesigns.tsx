import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';
import { Colors } from '../../constants/Colors';
import { Picker } from '@react-native-picker/picker';

const DESIGN_CATEGORIES = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 
  'Office', 'Garden', 'Dining Room', 'Exterior', 'Other'
];

interface DesignFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  tags: string;
  isPremium: boolean;
}

export default function UploadDesigns() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [formData, setFormData] = useState<DesignFormData>({
    name: '',
    price: '',
    category: '',
    description: '',
    tags: '',
    isPremium: false,
  });

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required', 
          'We need access to your photos to upload design images.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleInputChange = (field: keyof DesignFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('Image Required', 'Please select a design image to upload.');
      return;
    }

    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setUploading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful upload
      Alert.alert(
        'Upload Successful', 
        'Your design has been uploaded and is pending review.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setImage(null);
              setFormData({
                name: '',
                price: '',
                category: '',
                description: '',
                tags: '',
                isPremium: false,
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'An error occurred while uploading your design. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Upload New Design</Text>
      
      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Design Image *</Text>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={pickImage}
          disabled={uploading}
        >
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons 
                name="cloud-upload-outline" 
                size={48} 
                color={Colors.light.primary} 
              />
              <Text style={styles.placeholderText}>Select Design Image</Text>
              <Text style={styles.helperText}>JPG, PNG or WEBP (max 10MB)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Design Details Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Design Details</Text>
        
        {/* Design Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Design Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Modern Minimalist Living Room"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!uploading}
          />
        </View>

        {/* Price */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price (TZS) *</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>TZS</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="100,000"
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholderTextColor={Colors.light.textSecondary}
              editable={!uploading}
            />
          </View>
        </View>

        {/* Category Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity 
            style={[styles.input, styles.pickerInput]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            disabled={uploading}
          >
            <Text style={formData.category ? styles.pickerText : styles.placeholderText}>
              {formData.category || 'Select a category'}
            </Text>
            <MaterialIcons 
              name={showCategoryPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color={Colors.light.textSecondary} 
            />
          </TouchableOpacity>
          
          {showCategoryPicker && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(itemValue) => {
                  handleInputChange('category', itemValue);
                  setShowCategoryPicker(false);
                }}
                style={styles.picker}
                dropdownIconColor={Colors.light.primary}
              >
                <Picker.Item label="Select a category" value="" />
                {DESIGN_CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your design in detail..."
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholderTextColor={Colors.light.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!uploading}
          />
        </View>

        {/* Tags */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., modern, minimalist, scandinavian"
            value={formData.tags}
            onChangeText={(text) => handleInputChange('tags', text)}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!uploading}
          />
        </View>

        {/* Premium Toggle */}
        <View style={styles.premiumContainer}>
          <TouchableOpacity 
            style={styles.premiumToggle}
            onPress={() => handleInputChange('isPremium', !formData.isPremium)}
            disabled={uploading}
          >
            <View style={[
              styles.toggleSwitch,
              formData.isPremium && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleKnob,
                formData.isPremium && styles.toggleKnobActive
              ]} />
            </View>
            <Text style={styles.premiumLabel}>
              Mark as Premium Design
              <Text style={styles.premiumBadge}>PRO</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Upload Design</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: Colors.light.primary,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    fontFamily: 'Montserrat_500Medium',
    color: Colors.light.primary,
    marginTop: 8,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    backgroundColor: '#fff',
    color: Colors.light.text,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencySymbol: {
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: Colors.light.textSecondary,
    backgroundColor: '#f8f9fa',
    height: 48,
    textAlignVertical: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    borderLeftWidth: 1,
    borderRadius: 0,
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
  pickerText: {
    color: Colors.light.text,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  premiumContainer: {
    marginTop: 8,
  },
  premiumToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: Colors.light.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  premiumLabel: {
    fontFamily: 'Montserrat_500Medium',
    color: Colors.light.text,
    fontSize: 15,
  },
  premiumBadge: {
    backgroundColor: Colors.light.primary,
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 19,
    letterSpacing: 1,
  },
});