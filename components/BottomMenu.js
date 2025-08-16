import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../App';

const BottomMenu = React.memo(({ activeScreen, onNavigate }) => {
  const theme = useTheme();

  // Memoized menu items array
  const menuItems = useMemo(() => [
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
  ], []);

  // Memoized bottom menu container style
  const bottomMenuStyle = useMemo(() => [
    styles.bottomMenu,
    {
      backgroundColor: theme.colors.cardBackground,
      borderTopColor: theme.colors.border,
      shadowColor: theme.isDark ? '#000' : '#000',
    }
  ], [theme.colors.cardBackground, theme.colors.border, theme.isDark]);

  // Memoized menu item renderer
  const renderMenuItem = useCallback((item) => {
    const isActive = activeScreen === item.id;
    
    const menuItemStyle = [
      styles.menuItem,
      isActive && [
        styles.activeMenuItem,
        { backgroundColor: theme.isDark ? '#1e40af' : '#f0f9ff' }
      ]
    ];

    const iconContainerStyle = [
      styles.iconContainer,
      isActive && [
        styles.activeIconContainer,
        { backgroundColor: theme.colors.primaryButton }
      ]
    ];

    const labelStyle = [
      styles.menuLabel,
      { color: theme.colors.secondaryText },
      isActive && [
        styles.activeMenuLabel,
        { color: theme.colors.accentText }
      ]
    ];

    const activeIndicatorStyle = [
      styles.activeIndicator,
      { backgroundColor: theme.colors.primaryButton }
    ];

    return (
      <TouchableOpacity
        key={item.id}
        style={menuItemStyle}
        onPress={() => onNavigate(item.id)}
        activeOpacity={0.7}
      >
        <View style={iconContainerStyle}>
          <Text style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
            {isActive ? item.activeIcon : item.icon}
          </Text>
        </View>
        <Text style={labelStyle}>
          {item.label}
        </Text>
        {isActive ? <View style={activeIndicatorStyle} /> : null}
      </TouchableOpacity>
    );
  }, [activeScreen, onNavigate, theme.isDark, theme.colors.primaryButton, theme.colors.secondaryText, theme.colors.accentText]);

  return (
    <View style={bottomMenuStyle}>
      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>
    </View>
  );
});

BottomMenu.displayName = 'BottomMenu';

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
    // backgroundColor handled dynamically
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
    // backgroundColor handled dynamically
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
