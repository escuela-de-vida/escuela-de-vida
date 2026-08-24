import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1D1D1F" },
  cover: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold" },
  coverSubtitle: { fontSize: 14, color: "#6E6E73" },
  coverDate: { fontSize: 11, color: "#6E6E73", marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    marginTop: 20,
  },
  statsRow: { flexDirection: "row", gap: 24, marginBottom: 8 },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 9, color: "#6E6E73" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeChip: {
    flexDirection: "row",
    gap: 4,
    padding: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F5F5F7",
    borderRadius: 999,
    fontSize: 9,
  },
  bookCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
    gap: 4,
  },
  bookTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  bookMeta: { fontSize: 9, color: "#6E6E73" },
  bookReview: { fontSize: 10, marginTop: 4, lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#AEAEB2",
    textAlign: "center",
  },
});

export type BitacoraBook = {
  title: string;
  author: string | null;
  points: number | null;
  reviewText: string | null;
  finishedAt: string | null;
};

export type BitacoraBadge = { name: string; icon: string | null };

export function BitacoraDocument({
  studentName,
  rankName,
  points,
  streak,
  badges,
  books,
  generatedAt,
}: {
  studentName: string;
  rankName: string;
  points: number;
  streak: number;
  badges: BitacoraBadge[];
  books: BitacoraBook[];
  generatedAt: Date;
}) {
  const dateLabel = generatedAt.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>Bitácora de estudio</Text>
          <Text style={styles.coverSubtitle}>{studentName}</Text>
          <Text style={styles.coverSubtitle}>
            {rankName} · {points} pts · racha de {streak}{" "}
            {streak === 1 ? "día" : "días"}
          </Text>
          <Text style={styles.coverDate}>Generado el {dateLabel}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>puntos totales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>días de racha</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{badges.length}</Text>
            <Text style={styles.statLabel}>insignias</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{books.length}</Text>
            <Text style={styles.statLabel}>libros leídos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Insignias</Text>
        {badges.length === 0 ? (
          <Text style={{ color: "#6E6E73" }}>Todavía no hay insignias.</Text>
        ) : (
          <View style={styles.badgeRow}>
            {badges.map((b, i) => (
              <Text key={i} style={styles.badgeChip}>
                {b.name}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Libros leídos</Text>
        {books.length === 0 ? (
          <Text style={{ color: "#6E6E73" }}>Todavía no hay libros leídos.</Text>
        ) : (
          books.map((book, i) => (
            <View key={i} style={styles.bookCard}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookMeta}>
                {book.author ?? "Autor desconocido"}
                {book.points != null ? ` · ${book.points} pts` : ""}
                {book.finishedAt
                  ? ` · ${new Date(book.finishedAt).toLocaleDateString("es-AR")}`
                  : ""}
              </Text>
              {book.reviewText && (
                <Text style={styles.bookReview}>{book.reviewText}</Text>
              )}
            </View>
          ))
        )}

        <Text style={styles.footer} fixed>
          Escuela de Vida — bitácora personal de {studentName}
        </Text>
      </Page>
    </Document>
  );
}
