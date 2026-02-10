import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';

export default function TripAccommodationCard({
  accommodation,
  currentUserId,
  onMarkPaidPress,
  onEditPress,
}) {
  if (!accommodation) return null;

  const {
    title,
    link,
    address,
    startDate,
    endDate,
    notes,
    totalAmount,
    currency,
    payerId,
    participants = [],
    shares = {},
  } = accommodation;

  const youArePayer = currentUserId && payerId === currentUserId;

  const handleOpenLink = () => {
    if (link) {
      Linking.openURL(link).catch(() => {
        alert('Unable to open link. You can copy it manually.');
      });
    }
  };

  const formatAmount = (amount) =>
    `${currency || 'USD'} ${Number(amount || 0).toFixed(0)}`;

  const yourShare = currentUserId ? shares[currentUserId] : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title || 'Accommodation'}</Text>
        {onEditPress && (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {address ? <Text style={styles.address}>{address}</Text> : null}

      {(startDate || endDate) && (
        <Text style={styles.dates}>
          {startDate || '?'} {endDate ? `– ${endDate}` : ''}
        </Text>
      )}

      {link && (
        <TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
          <Text style={styles.linkText}>Open booking link</Text>
        </TouchableOpacity>
      )}

      {notes ? <Text style={styles.notes}>{notes}</Text> : null}

      {totalAmount ? (
        <View style={styles.costBox}>
          <Text style={styles.costLabel}>Total</Text>
          <Text style={styles.costValue}>{formatAmount(totalAmount)}</Text>
        </View>
      ) : null}

      {participants.length > 0 && (
        <View style={styles.splitSection}>
          <Text style={styles.splitTitle}>Who owes what</Text>
          {participants.map((id) => {
            const share = shares[id];
            if (!share) return null;
            const isYou = currentUserId === id;
            return (
              <View key={id} style={styles.shareRow}>
                <Text style={styles.shareName}>{isYou ? 'You' : id}</Text>
                <Text style={styles.shareAmount}>{formatAmount(share.amount)}</Text>
                <Text
                  style={[
                    styles.shareStatus,
                    share.status === 'paid' && styles.shareStatusPaid,
                  ]}
                >
                  {share.status === 'paid' ? 'Paid' : 'Owes'}
                </Text>
                {youArePayer && share.status !== 'paid' && (
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => onMarkPaidPress && onMarkPaidPress(id)}
                  >
                    <Text style={styles.markPaidText}>Mark paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {yourShare && !youArePayer && (
        <Text style={styles.yourShareHint}>
          You {yourShare.status === 'paid' ? 'already paid' : 'owe'}{' '}
          {formatAmount(yourShare.amount)} for this stay.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(175,174,143,0.4)',
    marginTop: 24,
    ...Platform.select({
      web: { boxShadow: '0 3px 16px rgba(53,103,105,0.12)' },
      default: { elevation: 2 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a3d',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#afae8f',
  },
  editButtonText: {
    fontSize: 13,
    color: '#356769',
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 2,
  },
  dates: {
    fontSize: 14,
    color: '#356769',
    marginTop: 4,
  },
  linkButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(53,103,105,0.08)',
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#356769',
    fontWeight: '600',
    fontSize: 14,
  },
  notes: {
    marginTop: 10,
    fontSize: 13,
    color: '#4a5568',
  },
  costBox: {
    marginTop: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(175,174,143,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 14,
    color: '#afae8f',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a3d',
  },
  splitSection: {
    marginTop: 14,
  },
  splitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 6,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shareName: {
    flex: 1,
    fontSize: 14,
    color: '#1a3a3d',
  },
  shareAmount: {
    fontSize: 14,
    color: '#4a5568',
    marginRight: 8,
  },
  shareStatus: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
    marginRight: 8,
  },
  shareStatusPaid: {
    color: '#166534',
  },
  markPaidBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#356769',
  },
  markPaidText: {
    fontSize: 12,
    color: '#356769',
    fontWeight: '600',
  },
  yourShareHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#356769',
  },
});

