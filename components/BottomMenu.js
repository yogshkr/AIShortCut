// components/BottomMenu.js (Dark Mode Support)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../App';

const BottomMenu = ({ activeScreen, onNavigate }) => {
  const theme = useTheme();

  const menuItems = [
    {
      id: 'Home',
      icon: '🏠',
      label: 'Home',
      activeIcon: '🏠',
    },
    {
      id: 'Saved',
      icon: '🔖',
      label: 'Saved',
      activeIcon: '💾',
    },
    {
      id: 'Profile',
      icon: '👤',
      label: 'Profile',
      activeIcon: '👤',
    },
  ];

  const renderMenuItem = (item) => {
    const isActive = activeScreen === item.id;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem, 
          isActive && [styles.activeMenuItem, { 
            backgroundColor: theme.isDark ? '#1e40af' : '#f0f9ff' 
          }]
        ]}
        onPress={() => onNavigate(item.id)}
      >
        <View style={[
          styles.iconContainer, 
          isActive && [styles.activeIconContainer, { 
            backgroundColor: theme.colors.primaryButton 
          }]
        ]}>
          <Text style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
            {isActive ? item.activeIcon : item.icon}
          </Text>
        </View>
        <Text style={[
          styles.menuLabel, 
          { color: theme.colors.secondaryText },
          isActive && [styles.activeMenuLabel, { color: theme.colors.accentText }]
        ]}>
          {item.label}
        </Text>
        {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primaryButton }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.bottomMenu, 
      { 
        backgroundColor: theme.colors.cardBackground,
        borderTopColor: theme.colors.border,
        shadowColor: theme.isDark ? '#000' : '#000',
      }
    ]}>
      <View style={styles.menuContainer}>
        {menuItems.map(item => renderMenuItem(item))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomMenu: {
    borderTopWidth: 1,
    paddingBottom: 25,
    paddingTop: 10,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    position: 'relative',
  },
  activeMenuItem: {
    // backgroundColor handled by theme
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    // backgroundColor handled by theme
  },
  menuIcon: {
    fontSize: 20,
  },
  activeMenuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeMenuLabel: {
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default BottomMenu;
