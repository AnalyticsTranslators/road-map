import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  goalsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  goalItem: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderLeft: '3px solid #0070f3',
    marginBottom: 8,
    width: '48%',
  },
  goalLabel: {
    fontSize: 11,
    color: '#444',
  },
  statusUpdate: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
  },
  statusMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusType: {
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
  },
  statusDate: {
    fontSize: 11,
    color: '#666',
  },
  statusContent: {
    fontSize: 12,
    color: '#333',
  },
  roadmapSection: {
    marginTop: 20,
  },
  milestone: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 4,
    borderLeft: '3px solid #0070f3',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#666',
  },
  milestoneContent: {
    fontSize: 12,
    color: '#444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  statusGroup: {
    marginBottom: 20,
  },
  statusGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1px solid #eee',
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
    borderBottom: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 5,
  },
  summary: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  kpiItem: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderLeft: '3px solid #0070f3',
    marginBottom: 8,
    width: '48%',
  },
  kpiText: {
    fontSize: 11,
    color: '#444',
  },
  kpisGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
});

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#f0fff4'; // Light green background
    case 'In Progress':
      return '#fff7e6'; // Light orange background
    case 'Not Started':
      return '#fff1f0'; // Light red background
    default:
      return '#f8f9fa';
  }
};

const getStatusTextColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#34c759'; // Green text
    case 'In Progress':
      return '#ff9500'; // Orange text
    case 'Not Started':
      return '#ff3b30'; // Red text
    default:
      return '#666';
  }
};

const ProjectPDF = ({ project, statusUpdates, milestones }) => {
  // Group status updates by type
  const groupedStatuses = {
    'Completed': statusUpdates?.filter(s => s.status_type === 'Completed') || [],
    'In Progress': statusUpdates?.filter(s => s.status_type === 'In Progress') || [],
    'Not Started': statusUpdates?.filter(s => s.status_type === 'Not Started') || []
  };

  // Helper function to get KPI details
  const getKPIDetails = (kpiId) => {
    const KPI_MAP = {
      better_conversations: {
        icon: '💬',
        text: 'Enable better conversations with clients'
      },
      collaborate_insights: {
        icon: '📊',
        text: 'Collaborate across functions to deliver scalable data insights'
      },
      kpi_solutions: {
        icon: '📈',
        text: 'Enable business with KPI Measurement Solutions'
      }
    };
    return KPI_MAP[kpiId] || null;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.projectTitle}>{project.name}</Text>
          <Text style={styles.projectDate}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.summary}>{project.summary}</Text>
        </View>

        {/* Team KPIs Section - Updated */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team KPIs</Text>
          <View style={styles.kpisGrid}>
            {project.kpis?.map((kpiId) => {
              const kpi = getKPIDetails(kpiId);
              if (!kpi) return null;
              
              return (
                <View key={kpiId} style={styles.kpiItem}>
                  <Text style={styles.kpiText}>{kpi.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Team Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Goals</Text>
          <View style={styles.goalsGrid}>
            {project.goals?.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalLabel}>{goal.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Status Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Updates</Text>
          
          {/* Completed Status Updates */}
          {groupedStatuses['Completed'].length > 0 && (
            <View style={styles.statusGroup}>
              <Text style={[styles.statusGroupTitle, { color: getStatusTextColor('Completed') }]}>
                Completed
              </Text>
              {groupedStatuses['Completed'].map((status, index) => (
                <View key={index} style={[
                  styles.statusUpdate,
                  { backgroundColor: getStatusColor(status.status_type) }
                ]}>
                  <View style={styles.statusMeta}>
                    <Text style={styles.statusDate}>
                      {new Date(status.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.statusContent}>{status.content}</Text>
                </View>
              ))}
            </View>
          )}

          {/* In Progress Status Updates */}
          {groupedStatuses['In Progress'].length > 0 && (
            <View style={styles.statusGroup}>
              <Text style={[styles.statusGroupTitle, { color: getStatusTextColor('In Progress') }]}>
                In Progress
              </Text>
              {groupedStatuses['In Progress'].map((status, index) => (
                <View key={index} style={[
                  styles.statusUpdate,
                  { backgroundColor: getStatusColor(status.status_type) }
                ]}>
                  <View style={styles.statusMeta}>
                    <Text style={styles.statusDate}>
                      {new Date(status.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.statusContent}>{status.content}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Not Started Status Updates */}
          {groupedStatuses['Not Started'].length > 0 && (
            <View style={styles.statusGroup}>
              <Text style={[styles.statusGroupTitle, { color: getStatusTextColor('Not Started') }]}>
                Not Started
              </Text>
              {groupedStatuses['Not Started'].map((status, index) => (
                <View key={index} style={[
                  styles.statusUpdate,
                  { backgroundColor: getStatusColor(status.status_type) }
                ]}>
                  <View style={styles.statusMeta}>
                    <Text style={styles.statusDate}>
                      {new Date(status.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.statusContent}>{status.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Roadmap Section */}
        <View style={styles.roadmapSection}>
          <Text style={styles.sectionTitle}>Project Roadmap</Text>
          {milestones?.map((milestone, index) => (
            <View key={index} style={styles.milestone}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneDate}>{milestone.date}</Text>
              </View>
              <Text style={styles.milestoneContent}>{milestone.description}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated via GM Insights Roadmap • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default ProjectPDF; 