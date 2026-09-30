import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  IndianRupee,
  Plus,
  Wallet,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import {
  PageHeader,
  StatCard,
  StatusBadge,
  currency,
} from "@/components/common/ui-kit";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute(
  "/admin/payments"
)({
  head: () => ({
    meta: [
      {
        title: "Payments — Smart Gym Admin",
      },
      {
        name: "description",
        content:
          "Track collected fees, pending dues and record new gym payments.",
      },
      {
        property: "og:title",
        content:
          "Payments — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "Track collected fees, pending dues and record payments.",
      },
    ],
  }),

  component: PaymentsPage,
});


// =====================================================
// TYPES
// =====================================================

type MemberOption = {
  id: string;
  name: string;
  plan: string;
  fee: number;
};


// =====================================================
// PAYMENT TYPE
// =====================================================

type Payment = {
  _id: string;
  memberId: string;
  memberName: string;
  plan: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  method: string;
  date: string;
  status: "Paid" | "Partial" | "Pending";
};


// =====================================================
// PAGE
// =====================================================

function PaymentsPage() {

  // ===================================================
  // PAGE STATE
  // ===================================================

  const [status, setStatus] =
    useState("outstanding");

  const [open, setOpen] =
    useState(false);


  // ===================================================
  // PAYMENTS STATE
  // ===================================================

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loadingPayments, setLoadingPayments] =
    useState(true);


  // ===================================================
  // MEMBERS STATE
  // ===================================================

  const [members, setMembers] =
    useState<MemberOption[]>([]);

  const [loadingMembers, setLoadingMembers] =
    useState(false);


  // ===================================================
  // FORM STATE
  // ===================================================

  const [selectedMemberId, setSelectedMemberId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("UPI");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [saving, setSaving] =
    useState(false);


  // ===================================================
  // GET TOKEN
  // ===================================================

  const getToken = () =>
    localStorage.getItem(
      "smartgym.token"
    );


  // ===================================================
  // FETCH MEMBERS
  // ===================================================

  const fetchMembers = async () => {

    try {

      setLoadingMembers(true);

      const token = getToken();

      const response =
        await fetch(
          "http://localhost:5000/api/auth/admin/members",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        toast.error(
          data.message ||
            "Failed to load members"
        );

        return;
      }


      // -----------------------------------------------
      // Format members
      // -----------------------------------------------

      const formattedMembers: MemberOption[] =
        (data.members || []).map(
          (member: any) => ({
            id: member._id,

            name:
              member.name ||
              "Unknown member",

            plan:
              member.membershipPlan ||
              "—",

            fee:
              Number(
                member.amountPaid || 0
              ),
          })
        );


      setMembers(
        formattedMembers
      );


      // -----------------------------------------------
      // Select first member automatically
      // -----------------------------------------------

      const firstMember =
        formattedMembers[0];

      if (firstMember) {

        setSelectedMemberId(
          firstMember.id
        );
      }

    } catch (error) {

      console.error(
        "Members fetch error:",
        error
      );

      toast.error(
        "Failed to load members"
      );

    } finally {

      setLoadingMembers(false);
    }
  };


  // ===================================================
  // FETCH PAYMENTS
  // ===================================================

  const fetchPayments = async () => {

    try {

      setLoadingPayments(true);

      const token = getToken();

      const response =
        await fetch(
          "http://localhost:5000/api/payments",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        toast.error(
          data.message ||
            "Failed to load payments"
        );

        return;
      }


      setPayments(
        data.payments || []
      );

    } catch (error) {

      console.error(
        "Payments fetch error:",
        error
      );

      toast.error(
        "Failed to load payments"
      );

    } finally {

      setLoadingPayments(false);
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    fetchMembers();

    fetchPayments();

  }, []);


  // ===================================================
  // SELECTED MEMBER
  // ===================================================

  const selectedMember =
    members.find(
      (member) =>
        member.id ===
        selectedMemberId
    );


  // ===================================================
  // FILTER PAYMENT TABLE
  // ===================================================

  const rows = useMemo(() => {

    return payments.filter(
      (payment) => {

        // ---------------------------------------------
        // Default:
        // Outstanding payments only
        // ---------------------------------------------

        if (
          status ===
          "outstanding"
        ) {

          return (
            payment.status !==
            "Paid"
          );
        }


        // ---------------------------------------------
        // All payment history
        // ---------------------------------------------

        if (
          status ===
          "all"
        ) {

          return true;
        }


        // ---------------------------------------------
        // Specific status
        // ---------------------------------------------

        return (
          payment.status ===
          status
        );
      }
    );

  }, [
    payments,
    status,
  ]);


  // ===================================================
  // CURRENT MONTH
  // ===================================================

  const now =
    new Date();

  const currentMonth =
    now.getMonth();

  const currentYear =
    now.getFullYear();


  // ===================================================
  // PAYMENTS OF CURRENT MONTH
  // ===================================================

  const currentMonthPayments =
    payments.filter(
      (payment) => {

        const paymentDate =
          new Date(
            payment.date
          );

        return (
          paymentDate.getMonth() ===
            currentMonth &&
          paymentDate.getFullYear() ===
            currentYear
        );
      }
    );


  // ===================================================
  // COLLECTED THIS MONTH
  // ===================================================

  const collected =
    currentMonthPayments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.paidAmount || 0
        ),
      0
    );


  // ===================================================
  // OUTSTANDING DUES
  // ===================================================

  /*
   * IMPORTANT:
   *
   * Outstanding dues should NOT reset
   * every month.
   *
   * If someone owes ₹500 from September,
   * that ₹500 should still be outstanding
   * in October.
   */

  const outstanding =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.remaining || 0
        ),
      0
    );


  // ===================================================
  // TRANSACTIONS THIS MONTH
  // ===================================================

  const transactions =
    currentMonthPayments.length;


  // ===================================================
  // RECORD PAYMENT
  // ===================================================

  const handleRecordPayment =
    async (
      e: FormEvent<HTMLFormElement>
    ) => {

      e.preventDefault();


      // -----------------------------------------------
      // Validate member
      // -----------------------------------------------

      if (!selectedMember) {

        toast.error(
          "Please select a member"
        );

        return;
      }


      // -----------------------------------------------
      // Validate amount
      // -----------------------------------------------

      const numericAmount =
        Number(amount);

      if (
        !numericAmount ||
        numericAmount <= 0
      ) {

        toast.error(
          "Please enter a valid amount"
        );

        return;
      }


      // -----------------------------------------------
      // Validate method
      // -----------------------------------------------

      if (!method) {

        toast.error(
          "Please select a payment method"
        );

        return;
      }


      // -----------------------------------------------
      // Validate date
      // -----------------------------------------------

      if (!date) {

        toast.error(
          "Please select a payment date"
        );

        return;
      }


      // -----------------------------------------------
      // Current total fee
      // -----------------------------------------------

      const totalAmount =
        selectedMember.fee;


      if (
        totalAmount <= 0
      ) {

        toast.error(
          "This member does not have a valid fee amount"
        );

        return;
      }


      // -----------------------------------------------
      // Amount cannot exceed total
      // -----------------------------------------------

      if (
        numericAmount >
        totalAmount
      ) {

        toast.error(
          "Payment cannot be greater than the total amount"
        );

        return;
      }


      try {

        setSaving(true);

        const token =
          getToken();


        // ---------------------------------------------
        // Send payment
        // ---------------------------------------------

        const response =
          await fetch(
            "http://localhost:5000/api/payments",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                memberId:
                  selectedMember.id,

                memberName:
                  selectedMember.name,

                plan:
                  selectedMember.plan,

                totalAmount,

                paidAmount:
                  numericAmount,

                method,

                date,

              }),
            }
          );


        const data =
          await response.json();


        // ---------------------------------------------
        // Handle error
        // ---------------------------------------------

        if (
          !response.ok ||
          !data.success
        ) {

          toast.error(
            data.message ||
              "Failed to record payment"
          );

          return;
        }


        // ---------------------------------------------
        // Success
        // ---------------------------------------------

        toast.success(
          "Payment recorded successfully"
        );


        // ---------------------------------------------
        // Reset form
        // ---------------------------------------------

        setAmount("");

        setMethod("UPI");

        setDate(
          new Date()
            .toISOString()
            .split("T")[0]
        );

        setOpen(false);


        // ---------------------------------------------
        // Refresh payments
        // ---------------------------------------------

        await fetchPayments();

      } catch (error) {

        console.error(
          "Record payment error:",
          error
        );

        toast.error(
          "Something went wrong while recording payment"
        );

      } finally {

        setSaving(false);
      }
    };


  // ===================================================
  // MARK PAYMENT AS PAID
  // ===================================================

  const handleMarkPaid =
    async (
      paymentId: string
    ) => {

      try {

        const token =
          getToken();


        const response =
          await fetch(
            `http://localhost:5000/api/payments/${paymentId}/paid`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const data =
          await response.json();


        // ---------------------------------------------
        // Error
        // ---------------------------------------------

        if (
          !response.ok ||
          !data.success
        ) {

          toast.error(
            data.message ||
              "Failed to mark payment as paid"
          );

          return;
        }


        // ---------------------------------------------
        // Success
        // ---------------------------------------------

        toast.success(
          "Payment marked as paid"
        );


        // ---------------------------------------------
        // Update local state
        // ---------------------------------------------

        setPayments(
          (previousPayments) =>
            previousPayments.map(
              (payment) => {

                if (
                  payment._id !==
                  paymentId
                ) {

                  return payment;
                }


                return {
                  ...payment,

                  paidAmount:
                    data.payment
                      ?.paidAmount ??
                    payment.totalAmount,

                  remaining:
                    data.payment
                      ?.remaining ??
                    0,

                  status:
                    data.payment
                      ?.status ??
                    "Paid",
                };
              }
            )
        );

      } catch (error) {

        console.error(
          "Mark paid error:",
          error
        );

        toast.error(
          "Something went wrong"
        );
      }
    };


  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <PageHeader
        title="Payments"
        description="Fee collection and outstanding dues"
        action={
          <div className="flex gap-2">

            {/* ----------------------------------------- */}
            {/* EXPORT */}
            {/* ----------------------------------------- */}

            <Button
              variant="outline"
              onClick={() =>
                toast.success(
                  "Invoice export queued"
                )
              }
            >
              <Download className="mr-2 size-4" />

              Export
            </Button>


            {/* ----------------------------------------- */}
            {/* RECORD PAYMENT */}
            {/* ----------------------------------------- */}

            <Dialog
              open={open}
              onOpenChange={setOpen}
            >

              <DialogTrigger asChild>

                <Button>
                  <Plus className="mr-2 size-4" />

                  Record payment
                </Button>

              </DialogTrigger>


              <DialogContent>

                <DialogHeader>

                  <DialogTitle>
                    Record payment
                  </DialogTitle>

                </DialogHeader>


                {/* ===================================== */}
                {/* PAYMENT FORM */}
                {/* ===================================== */}

                <form
                  className="space-y-4"
                  onSubmit={
                    handleRecordPayment
                  }
                >

                  {/* ----------------------------------- */}
                  {/* MEMBER */}
                  {/* ----------------------------------- */}

                  <div className="space-y-2">

                    <Label>
                      Member
                    </Label>

                    <Select
                      value={
                        selectedMemberId
                      }
                      onValueChange={
                        setSelectedMemberId
                      }
                      disabled={
                        loadingMembers ||
                        saving
                      }
                    >

                      <SelectTrigger>

                        <SelectValue
                          placeholder={
                            loadingMembers
                              ? "Loading members..."
                              : "Select member"
                          }
                        />

                      </SelectTrigger>


                      <SelectContent>

                        {members.length ===
                        0 ? (

                          <SelectItem
                            value="no-members"
                            disabled
                          >
                            No members found
                          </SelectItem>

                        ) : (

                          members.map(
                            (member) => (

                              <SelectItem
                                key={
                                  member.id
                                }
                                value={
                                  member.id
                                }
                              >

                                {member.name} ·{" "}
                                {member.plan}

                              </SelectItem>

                            )
                          )

                        )}

                      </SelectContent>

                    </Select>

                  </div>


                  {/* ----------------------------------- */}
                  {/* SELECTED MEMBER */}
                  {/* ----------------------------------- */}

                  {selectedMember && (

                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">

                      <div className="flex justify-between">

                        <span className="text-muted-foreground">
                          Member
                        </span>

                        <span className="font-medium">
                          {
                            selectedMember.name
                          }
                        </span>

                      </div>


                      <div className="mt-2 flex justify-between">

                        <span className="text-muted-foreground">
                          Plan
                        </span>

                        <span className="font-medium">
                          {
                            selectedMember.plan
                          }
                        </span>

                      </div>


                      <div className="mt-2 flex justify-between">

                        <span className="text-muted-foreground">
                          Current fee
                        </span>

                        <span className="font-medium">
                          {currency(
                            selectedMember.fee
                          )}
                        </span>

                      </div>

                    </div>

                  )}


                  {/* ----------------------------------- */}
                  {/* AMOUNT + METHOD */}
                  {/* ----------------------------------- */}

                  <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">

                      <Label>
                        Amount
                      </Label>

                      <Input
                        name="amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) =>
                          setAmount(
                            e.target.value
                          )
                        }
                        placeholder="Enter amount"
                        disabled={
                          saving
                        }
                        required
                      />

                    </div>


                    <div className="space-y-2">

                      <Label>
                        Method
                      </Label>

                      <Select
                        value={method}
                        onValueChange={
                          setMethod
                        }
                        disabled={
                          saving
                        }
                      >

                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Cash">
                            Cash
                          </SelectItem>

                          <SelectItem value="UPI">
                            UPI
                          </SelectItem>

                          <SelectItem value="Card">
                            Card
                          </SelectItem>

                          <SelectItem value="Bank Transfer">
                            Bank Transfer
                          </SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>


                  {/* ----------------------------------- */}
                  {/* DATE */}
                  {/* ----------------------------------- */}

                  <div className="space-y-2">

                    <Label>
                      Date
                    </Label>

                    <Input
                      name="date"
                      type="date"
                      value={date}
                      onChange={(e) =>
                        setDate(
                          e.target.value
                        )
                      }
                      disabled={
                        saving
                      }
                      required
                    />

                  </div>


                  {/* ----------------------------------- */}
                  {/* SAVE BUTTON */}
                  {/* ----------------------------------- */}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      saving ||
                      loadingMembers ||
                      members.length ===
                        0
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save payment"}
                  </Button>

                </form>

              </DialogContent>

            </Dialog>

          </div>
        }
      />


      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">

        {/* --------------------------------------------- */}
        {/* COLLECTED THIS MONTH */}
        {/* --------------------------------------------- */}

        <StatCard
          label="Collected this month"
          value={currency(
            collected
          )}
          icon={IndianRupee}
          tone="success"
        />


        {/* --------------------------------------------- */}
        {/* OUTSTANDING */}
        {/* --------------------------------------------- */}

        <StatCard
          label="Outstanding dues"
          value={currency(
            outstanding
          )}
          icon={Wallet}
          tone="warning"
        />


        {/* --------------------------------------------- */}
        {/* TRANSACTIONS THIS MONTH */}
        {/* --------------------------------------------- */}

        <StatCard
          label="Transactions this month"
          value={transactions}
          icon={Download}
        />

      </div>


      {/* ================================================= */}
      {/* PAYMENT TABLE */}
      {/* ================================================= */}

      <Card className="mt-6">

        <CardContent className="space-y-4 p-5">

          {/* --------------------------------------------- */}
          {/* STATUS FILTER */}
          {/* --------------------------------------------- */}

          <Select
            value={status}
            onValueChange={
              setStatus
            }
          >

            <SelectTrigger className="w-56">

              <SelectValue />

            </SelectTrigger>


            <SelectContent>

              <SelectItem value="outstanding">
                Outstanding payments
              </SelectItem>

              <SelectItem value="all">
                All payments
              </SelectItem>

              <SelectItem value="Paid">
                Paid
              </SelectItem>

              <SelectItem value="Partial">
                Partial
              </SelectItem>

              <SelectItem value="Pending">
                Pending
              </SelectItem>

            </SelectContent>

          </Select>


          {/* --------------------------------------------- */}
          {/* TABLE */}
          {/* --------------------------------------------- */}

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>
                    Invoice
                  </TableHead>

                  <TableHead>
                    Member
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Plan
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Remaining
                  </TableHead>

                  <TableHead>
                    Method
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead className="text-right">
                    Action
                  </TableHead>

                </TableRow>

              </TableHeader>


              <TableBody>

                {/* --------------------------------------- */}
                {/* LOADING */}
                {/* --------------------------------------- */}

                {loadingPayments ? (

                  <TableRow>

                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading payments...
                    </TableCell>

                  </TableRow>

                ) : rows.length === 0 ? (

                  /* ------------------------------------- */
                  /* EMPTY */
                  /* ------------------------------------- */

                  <TableRow>

                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No payments found
                    </TableCell>

                  </TableRow>

                ) : (

                  /* ------------------------------------- */
                  /* PAYMENT ROWS */
                  /* ------------------------------------- */

                  rows.map(
                    (payment) => (

                      <TableRow
                        key={
                          payment._id
                        }
                      >

                        <TableCell className="font-mono text-xs">
                          {
                            payment._id
                          }
                        </TableCell>


                        <TableCell className="font-medium">
                          {
                            payment.memberName
                          }
                        </TableCell>


                        <TableCell className="text-sm text-muted-foreground">

                          {payment.date
                            ? new Date(
                                payment.date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}

                        </TableCell>


                        <TableCell>
                          {
                            payment.plan
                          }
                        </TableCell>


                        <TableCell>
                          {currency(
                            payment.paidAmount
                          )}
                        </TableCell>


                        <TableCell
                          className={
                            payment.remaining >
                            0
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                          {currency(
                            payment.remaining
                          )}
                        </TableCell>


                        <TableCell className="text-sm text-muted-foreground">
                          {
                            payment.method
                          }
                        </TableCell>


                        <TableCell>

                          <StatusBadge
                            status={
                              payment.status
                            }
                          />

                        </TableCell>


                        <TableCell className="text-right">

                          {payment.status !==
                            "Paid" && (

                            <Button
                              size="sm"
                              onClick={() =>
                                handleMarkPaid(
                                  payment._id
                                )
                              }
                            >
                              Paid
                            </Button>

                          )}

                        </TableCell>

                      </TableRow>

                    )
                  )

                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>
    </>
  );
}