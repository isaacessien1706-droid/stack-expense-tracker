#include <iostream>
#include <vector>
#include <string>
#include <iomanip>

// Represents a single approval stamp on the invoice
struct ApprovalStamp {
    int level;
    std::string roleTitle;
    std::string approverName;
    std::string comment;
};

// Pure LIFO Bounded Stack Class
template <typename T>
class Stack {
private:
    std::vector<T> items;
    int maxCapacity;

public:
    Stack(int capacity = 4) : maxCapacity(capacity) {}

    bool isEmpty() const { return items.empty(); }
    bool isFull() const { return static_cast<int>(items.size()) >= maxCapacity; }
    int size() const { return static_cast<int>(items.size()); }
    int getCapacity() const { return maxCapacity; }

    void push(const T& item) {
        if (!isFull()) {
            items.push_back(item);
        }
    }

    T pop() {
        T topItem = items.back();
        items.pop_back();
        return topItem;
    }

    T peek() const {
        return items.back();
    }
};

// Workplace Application: Corporate Expense Approval Chain
class ExpenseInvoiceWorkflow {
private:
    std::string invoiceTitle;
    double amount;
    Stack<ApprovalStamp> approvalStack; // Main stack holding active signatures
    Stack<ApprovalStamp> tempStack;     // Helper stack to print chain without array indexing

    // The 4 required hierarchy levels
    const std::vector<std::string> hierarchyRoles = {
        "1. Employee Submission",
        "2. Team Lead Sign-Off",
        "3. Finance Manager Audit",
        "4. Executive Director Final Sign-Off"
    };

public:
    ExpenseInvoiceWorkflow(const std::string& title, double amt)
        : invoiceTitle(title), amount(amt), approvalStack(4), tempStack(4) {}

    // 1. PUSH OPERATION: Current level approves and pushes their stamp onto the stack
    void approveNextLevel(const std::string& personName, const std::string& note) {
        if (approvalStack.isFull()) {
            std::cout << "\n[STACK FULL / FULLY APPROVED] Invoice \"" << invoiceTitle 
                      << "\" already has all 4 required signatures! Ready for bank payout.\n";
            return;
        }

        int nextLevelIndex = approvalStack.size(); // 0 to 3
        ApprovalStamp stamp{
            nextLevelIndex + 1,
            hierarchyRoles[nextLevelIndex],
            personName,
            note
        };

        approvalStack.push(stamp);
        std::cout << "[PUSH -> APPROVED] " << stamp.roleTitle << " stamped by " 
                  << stamp.approverName << " (\"" << stamp.comment << "\")\n";

        if (approvalStack.isFull()) {
            std::cout << "  >>> [PAYOUT UNLOCKED!] All 4 hierarchy levels complete! <<<\n";
        }
    }

    // 2. POP OPERATION: Higher authority spots an issue and pops back 1 level
    void rejectAndStepBack(const std::string& reason) {
        if (approvalStack.isEmpty()) {
            std::cout << "\n[STACK UNDERFLOW] No approvals on stack to revoke! Invoice is unsubmitted.\n";
            return;
        }

        ApprovalStamp revoked = approvalStack.pop();
        std::cout << "\n[POP <- REJECTED BACK 1 LEVEL] Revoked \"" << revoked.roleTitle 
                  << "\" (Signed by " << revoked.approverName << ").\n"
                  << "  Reason: " << reason << "\n";

        if (!approvalStack.isEmpty()) {
            std::cout << "  [RETURNED TO] Invoice sits back on desk of: " 
                      << approvalStack.peek().roleTitle << " (" 
                      << approvalStack.peek().approverName << ") for correction.\n";
        } else {
            std::cout << "  [RETURNED TO] Invoice is completely unsigned (back to Employee draft).\n";
        }
    }

    // 3. PEEK OPERATION: Inspect who last signed off on the document
    void inspectLatestStamp() const {
        if (approvalStack.isEmpty()) {
            std::cout << "\n[PEEK] Invoice has 0 signatures. Awaiting Employee submission.\n";
            return;
        }
        ApprovalStamp top = approvalStack.peek();
        std::cout << "\n[PEEK TOP STAMP] Highest authority reached so far: Level " 
                  << top.level << " - " << top.roleTitle << " by " << top.approverName << "\n";
    }

    // 4. PURE STACK DISPLAY: Uses pop/push into tempStack (Zero array indexing!)
    void displayApprovalChain() {
        std::cout << "\n================ INVOICE APPROVAL STACK ================\n";
        std::cout << " Invoice: " << invoiceTitle << " ($" << std::fixed << std::setprecision(2) << amount << ")\n";
        std::cout << " Status : " << approvalStack.size() << " / " << approvalStack.getCapacity() << " Signatures\n";
        std::cout << "--------------------------------------------------------\n";

        if (approvalStack.isEmpty()) {
            std::cout << "   [ NO SIGNATURES YET - STACK IS EMPTY ]\n";
        } else {
            bool isTop = true;
            // Pop each stamp to print top-down, pushing into tempStack
            while (!approvalStack.isEmpty()) {
                ApprovalStamp s = approvalStack.pop();
                tempStack.push(s);
                std::cout << (isTop ? "  [TOP STAMP] -> " : "  [LOCKED]    -> ")
                          << s.roleTitle << " | By: " << std::setw(10) << std::left << s.approverName
                          << " | Note: \"" << s.comment << "\"\n";
                isTop = false;
            }
            // Restore all stamps back to approvalStack in exact original order
            while (!tempStack.isEmpty()) {
                approvalStack.push(tempStack.pop());
            }
        }
        std::cout << "========================================================\n\n";
    }
};

int main() {
    ExpenseInvoiceWorkflow invoice("Cloud Server Upgrade", 4500.00);

    // Step 1: Employee submits and Team Lead & Finance Manager approve
    invoice.approveNextLevel("Kwame (Dev)", "Attached vendor quote");
    invoice.approveNextLevel("Ama (Lead)", "Budget verified for Q4");
    invoice.approveNextLevel("Kofi (Finance)", "Tax receipt checked");
    invoice.displayApprovalChain();

    // Step 2: Peek at the current top signature before Director reviews
    invoice.inspectLatestStamp();

    // Step 3: Director spots an issue with the tax calculation and POPs it back!
    invoice.rejectAndStepBack("VAT calculation is missing 2.5% levy. Finance must re-audit.");
    invoice.displayApprovalChain();

    // Step 4: Finance Manager fixes the issue and re-pushes their approval, followed by Director
    invoice.approveNextLevel("Kofi (Finance)", "Updated VAT levy calculation");
    invoice.approveNextLevel("Esi (Director)", "Final executive sign-off granted");
    invoice.displayApprovalChain();

    // Step 5: Demonstrate Stack Overflow protection (trying to add a 5th stamp)
    invoice.approveNextLevel("CEO", "Extra stamp attempt");

    return 0;
}