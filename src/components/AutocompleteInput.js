import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';

const DEBOUNCE_MS = 350;

export default function AutocompleteInput({
  value,
  onChangeText,
  placeholder,
  searchFunction,
  onSelect,
  style,
  ...textInputProps
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const searchGenerationRef = useRef(0);

  useEffect(() => {
    if (!value || value.length === 0 || !searchFunction) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    const generation = ++searchGenerationRef.current;

    const runSearch = () => {
      const result = searchFunction(value);
      const isPromise = result && typeof result.then === 'function';

      if (isPromise) {
        setLoading(true);
        result.then((list) => {
          if (generation !== searchGenerationRef.current) return;
          const items = Array.isArray(list) ? list : [];
          setSuggestions(items);
          setShowSuggestions(items.length > 0);
          setLoading(false);
        }).catch(() => {
          if (generation !== searchGenerationRef.current) return;
          setSuggestions([]);
          setShowSuggestions(false);
          setLoading(false);
        });
      } else {
        const items = Array.isArray(result) ? result : [];
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      }
    };

    debounceRef.current = setTimeout(runSearch, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [value, searchFunction]);

  const handleSelect = (item) => {
    const displayValue = item.fullName || item.name || item;
    onChangeText(displayValue);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(item);
    }
    // Blur input on mobile after selection
    if (inputRef.current && Platform.OS !== 'web') {
      inputRef.current.blur();
    }
  };

  const handleChangeText = (text) => {
    onChangeText(text);
    setSelectedIndex(-1);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <View style={[styles.container, style]} ref={containerRef}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...textInputProps}
      />
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <View style={styles.suggestionsContainer}>
          {loading && suggestions.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#356769" />
              <Text style={styles.loadingText}>Searching airports...</Text>
            </View>
          ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => 
              (item.code && item.name) ? `${item.code}-${item.name}-${index}` : `suggestion-${index}`
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionText}>
                    {item.fullName || item.name || item}
                  </Text>
                  {item.code && (
                    <Text style={styles.suggestionCode}>{item.code}</Text>
                  )}
                </View>
                {item.type && (
                  <Text style={styles.suggestionType}>
                    {item.type === 'airport' ? '✈️' : '📍'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 4,
    maxHeight: 200,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  suggestionCode: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionType: {
    fontSize: 16,
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
