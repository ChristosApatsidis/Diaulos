import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Register Roboto font for Greek support
Font.register({
  family: "Roboto",
  src: "/fonts/Roboto/static/Roboto-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Roboto",
    backgroundColor: "#f7f7fa",
    color: "#222",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2a4365",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2a4365",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  label: {
    fontSize: 10,
    color: "#4a5568",
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#222",
    marginBottom: 8,
  },
  userId: {
    fontSize: 10,
    color: "#4a5568",
  },
});

/**
 * Component to generate a PDF document with user profile information, supporting both English and Greek languages.
 * @param user - The user data to populate the PDF.
 * @param locale - The current locale (e.g., "en" or "el") to determine the language of the content.
 * @param generalTranslations - An object containing general translations for labels and values.
 * @param personalInfoTranslations - An object containing translations specific to personal information.
 * @param militaryInformationTranslations - An object containing translations specific to military information.
 * @param accountInformationTranslations - An object containing translations specific to account information.
 * @returns A PDF document component that can be rendered and downloaded by the user.
 */
export function UserDetailsPDF({
  user,
  locale,
  generalTranslations,
  personalInfoTranslations,
  militaryInformationTranslations,
  accountInformationTranslations,
}: {
  user?: any;
  locale: string;
  generalTranslations: any;
  personalInfoTranslations: any;
  militaryInformationTranslations: any;
  accountInformationTranslations: any;
}) {
  if (!user) {
    console.error("No user data available to generate PDF.");
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Row: Title left, User ID right */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.header}>
            {locale === "el" ? "Στοιχεία Χρήστη" : "User Information"}
          </Text>
          <Text style={styles.userId}>{user.id || "-"}</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.rowContainer}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {personalInfoTranslations("title")}
            </Text>

            <Text style={styles.label}>
              {personalInfoTranslations("infoRows.name")}
            </Text>
            <Text style={styles.value}>{user.name || "-"}</Text>

            <Text style={styles.label}>
              {personalInfoTranslations("infoRows.username")}
            </Text>
            <Text style={styles.value}>{user.username || "-"}</Text>

            <Text style={styles.label}>
              {personalInfoTranslations("infoRows.email")}
            </Text>
            <Text style={styles.value}>{user.email || "-"}</Text>

            <Text style={styles.label}>
              {accountInformationTranslations("infoRows.memberSince")}
            </Text>
            <Text style={styles.value}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("el-GR")
                : "-"}
            </Text>

            <Text style={styles.label}>
              {accountInformationTranslations("infoRows.lastUpdated")}
            </Text>
            <Text style={styles.value}>
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("el-GR")
                : "-"}
            </Text>
          </View>

          {/* Military Information */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {militaryInformationTranslations("title")}
            </Text>

            <Text style={styles.label}>
              {militaryInformationTranslations("infoRows.branch")}
            </Text>
            <Text style={styles.value}>{user.branch || "-"}</Text>

            <Text style={styles.label}>
              {militaryInformationTranslations(
                "infoRows.combatArmsSupportBranch",
              )}
            </Text>
            <Text style={styles.value}>
              {generalTranslations(`branches.${user.branch}`) ||
                user.branch ||
                "-"}
            </Text>

            <Text style={styles.label}>
              {militaryInformationTranslations("infoRows.rank")}
            </Text>
            <Text style={styles.value}>
              {generalTranslations(`ranks.${user.branch}.${user.rank}`) ||
                user.rank ||
                "-"}
            </Text>

            <Text style={styles.label}>
              {militaryInformationTranslations("infoRows.specialization")}
            </Text>
            <Text style={styles.value}>{user.specialization || "-"}</Text>

            <Text style={styles.label}>
              {militaryInformationTranslations("infoRows.unitOfService")}
            </Text>
            <Text style={styles.value}>{user.unitOfService || "-"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
