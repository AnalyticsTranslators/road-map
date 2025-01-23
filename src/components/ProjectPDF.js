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
  goalItem: {
    marginBottom: 8,
    padding: 8,
    borderLeft: '3px solid #0070f3',
    backgroundColor: '#f8f9fa',
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
});

const ProjectPDF = ({ project, statusUpdates, milestones }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.projectTitle}>{project.name}</Text>
        <Text style={styles.projectDate}>Generated on {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Status Updates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Updates</Text>
        {statusUpdates.map((status, index) => (
          <View key={index} style={[
            styles.statusUpdate,
            { backgroundColor: status.status_type === 'Not Started' ? '#fff1f0' : '#f6ffed' }
          ]}>
            <View style={styles.statusMeta}>
              <Text style={styles.statusType}>{status.status_type}</Text>
              <Text style={styles.statusDate}>
                {new Date(status.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.statusContent}>{status.content}</Text>
          </View>
        ))}
      </View>

      {/* Roadmap Section */}
      <View style={styles.roadmapSection}>
        <Text style={styles.sectionTitle}>Project Roadmap</Text>
        {milestones.map((milestone, index) => (
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

export default ProjectPDF; 